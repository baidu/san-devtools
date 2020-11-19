/* global SAN_DEVTOOL */
import initBackend from '@backend/initBackend';
import {install, DevToolsHook} from '@backend/hook';
import Bridge from '@shared/Bridge';

// 向 san 页面注入 hook
let sanHook = install(window);

if (sanHook) {
    const hook: DevToolsHook<{}> = window[SAN_DEVTOOL];

    let bridge = new Bridge({
        listen(fn: Function) {
            window.addEventListener('message', event => {
                if (
                    event.source !== window
                    || !event.data
                    || event.data.source !== 'san-devtools-content-script'
                    || !event.data.payload
                ) {
                    return;
                }
                fn(event.data.payload);
            });
        },
        send(data: any) {
            window.postMessage(
                {
                    source: 'san-devtools-bridge',
                    payload: data
                },
                '*'
            );
        }
    });

    initBackend(hook, bridge, window);

    // 版本信息：backend --win--> content-script --port--> background
    hook.on('san', () => {
        window.postMessage(
            {
                source: 'san-detector',
                payload: hook.san.version
            },
            '*'
        );
    });

    // 通知 frontend 刷新 store
    document.addEventListener('DOMContentLoaded', () => {
        bridge.send('SYSTEM:backendConnected', '');
    });
}
