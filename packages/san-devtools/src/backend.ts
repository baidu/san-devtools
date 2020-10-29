/* global __resourceQuery, __DEBUG__, SAN_DEVTOOL */
import EventEmitter from '@shared/EventEmitter';
import Bridge from '@shared/Bridge';
import {install, DevToolsHook} from '@backend/hook';
import initBackend from '@backend/initBackend';
import ready from '@shared/utils/ready';

import chobitsu from 'chobitsu';

import initLogger from '@frontend/utils/Logger';
import {createBackendSocketUrl, createFrontendUrl, getUrlPartsFromQuery} from './utils/url';
import getFavicon from './utils/getFavicon';
import WebSocket from './lib/WebSocket';
import {addStyle, addBtn} from './backendBtn';
import createBridge from './utils/createBridge';

if (__DEBUG__) {
    initLogger();
}

// 1. install hook
let sanHook = install(window);

if (sanHook) {
    const hook: DevToolsHook = window[SAN_DEVTOOL];
    // 2. init bridge
    let popup: Window;

    /**
     * 首先获取 urlParts
     */
    let resourceQuery = window.__san_devtool_ws_query__
        ? window.__san_devtool_ws_query__
        : __resourceQuery
            ? __resourceQuery
            : '';
    let urlParts = getUrlPartsFromQuery(resourceQuery);

    let isSock = urlParts.query && 'ws' in urlParts.query;

    let popupUrl: string;

    // 这里使用url的参数来定是ws还是window
    let bridge: Bridge;
    if (isSock) {
        const {url, sessionId} = createBackendSocketUrl(resourceQuery, location, {
            favicon: getFavicon(),
            title: document.title ? document.title : 'Untitled',
            url: location.href
        });
        if (__DEBUG__) {
            window.logger.green('websocket url', url);
        }
        const wss = new WebSocket(url);
        const sanChannel = wss.registerChannel('san');

        bridge = createBridge(sanChannel);
        const chiiChannel = wss.registerChannel('chii');

        popupUrl = createFrontendUrl(resourceQuery, sessionId);
        chiiChannel.on('message', event => {
            chobitsu.sendRawMessage(event.data);
        });

        chobitsu.setOnMessage((message: string) => {
            chiiChannel.send(message);
        });
    }
    else {
        bridge = new Bridge({
            listen(fn: Function) {
                window.addEventListener('message', ({data}) => {
                    // 这里去掉了origin的限制
                    if (__DEBUG__) {
                        window.logger.green('GET', data);
                    }
                    fn(data);
                });
            },
            send(data: any) {
                if (__DEBUG__) {
                    window.logger.red('SEND', data);
                }
                popup.postMessage(data, '*');
            }
        });
        popupUrl = createFrontendUrl(resourceQuery);
        // 4. san devtool btn
        let popupEvent = new EventEmitter();
        popupEvent.once('setPopup', (p: Window) => {
            popup = p;
        });
        ready(() => {
            /* eslint-disable @typescript-eslint/no-require-imports,@typescript-eslint/no-var-requires */
            const style: string = require('!!raw-loader?esModule=false!./backendStyle.css');

            /* eslint-disable @typescript-eslint/no-use-before-define */
            addStyle(document.head, style);
            addBtn(document.body, popupUrl, popupEvent);
        });
    }
    if (__DEBUG__) {
        window.logger.green('frontUrl', popupUrl);
    }
    // 3. init backend
    initBackend(hook, bridge, window);
}
