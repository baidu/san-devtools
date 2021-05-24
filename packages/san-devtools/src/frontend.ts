/* global __DEBUG__ */

import san from 'san';
import Bridge from '@shared/Bridge';

import DevTools from '@frontend/DevTools.san';
import {initFrontend} from '@frontend/initFrontend';
import initLogger from '@frontend/utils/Logger';
import WebSocket from './lib/WebSocket';
import createBridge from './utils/createBridge';

if (__DEBUG__) {
    initLogger();
}

// backend 所在页面刷新
// 1. backend 会 disconnect，接着会触发 frontend disconnect，此时 frontend 需要重新创建 websocket 建立链接
// 2. backend 重新创建 websocket 建立了链接
let resourceQuery = location.search;
let app: any = null;
let hasWs: boolean = false;
let timerId: null | ReturnType<typeof setTimeout>  = null;

class Container extends san.Component {
    static template = /* html */ `
        <div>
            <s-devtools bridge="{{bridge}}"></s-devtools>
        </div>
    `;
    static components = {
        's-devtools': DevTools
    };

    bridge: Bridge | null = null;

    constructor(bridge: Bridge | null) {
        super();
        this.bridge = bridge;
    }
    initData() {
        return {
            bridge: null // 发送消息
        };
    }
    created() {
        this.data.set('bridge', this.bridge);
    }
}

/**
 * 初始化 san-devtool 页面
 * @param connection
 */
function initialize(bridge: Bridge) {
    if (app) {
        console.log('app', bridge, bridge === app.data.get('bridge'));
        app.data.set('bridge', bridge);
    } else {
        app = new Container(bridge);
        app.attach(document.querySelector('#root') as Element);
    }
    // 渲染 frontend 页面
    // 初始化 frontend 监听事件
    initFrontend(bridge);
}

/**
 * 建立socket链接
 * @returns
 */
function socket() {
    if (hasWs) {
        hasWs = false;
        if (__DEBUG__) {
            let message = 'reconnect failed, YOUR BACKEND IS DEAD, CLOSE THIS PAGE';
            let color = '#DB2600';
            console.log(
                `%c san-devtools %c ${message} %c `,
                'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
                `background: ${color}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
                'background:transparent'
            );
        }
        return;
    }
    if (__DEBUG__) {
        let message = 'reconnecting';
        let color = '#3898b9';
        console.log(
            `%c san-devtools %c ${message} %c `,
            'background:#35495e ; padding: 1px; border-radius: 3px 0 0 3px;  color: #fff',
            `background: ${color}; padding: 1px; border-radius: 0 3px 3px 0;  color: #fff`,
            'background:transparent'
        );
    }
    const url = resourceQuery.replace(/^\??(.*)?=/, '$1://');
    const wss = new WebSocket(url);
    let _bridge = createBridge(wss);

    function next() {
        hasWs = false;
        // frontend 关闭的时候，触发 SYSTEM:backendDisconnected 清理 store
        _bridge.emit('SYSTEM:backendDisconnected');
        if (timerId) {
            clearTimeout(timerId);
        }
        // 开始重连
        timerId = setTimeout(socket, 1000);
    }
    wss.on('close', next);
    wss.on('error', next);
    wss.on('open', () => {
        console.log('initialize', _bridge.send);
        hasWs = true;
        // 确认建立链接之后，开始初始化 frontend
        initialize(_bridge);
    });
}

if (resourceQuery !== '' && resourceQuery.includes('ws')) {
    socket();
}
else {
    let bridge = new Bridge({
        listen(fn: Function) {
            window.addEventListener('message', ({data}) => {
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
            window.parent.postMessage(data, '*');
        }
    });
    setTimeout(() => {
        initialize(bridge);
    }, 30);
}
