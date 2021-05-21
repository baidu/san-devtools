/* global $devtools, SAN_DEVTOOL */
import Bridge from '@shared/Bridge';
import {install, DevToolsHook} from '@backend/hook';
import initBackend from '@backend/initBackend';

// 1. install hook
let sanHook = install(window);
if (sanHook) {
    const hook: DevToolsHook = window[SAN_DEVTOOL];

    // 2. init bridge
    // 2.1 获取$devtools的wsurl
    // 计算url的channelId
    const channelId = $devtools.nanoid();
    // 监听获取url的地址事件
    $devtools.registerEvent('SanDevtools.getWebsocketUrl', () => {
        return $devtools.createWebsocketUrl(`/frontend/${channelId}`);
    });
    // -> 这里注意路径必须是/backend/开头
    const wsUrl = $devtools.createWebsocketUrl(`/backend/${channelId}`);
    // 2.2 创建通道
    const ws = $devtools.createWebsocketConnection(wsUrl);

    // 2.3 绑定Bridge
    const bridge = getWebSocketBridge(ws);
    // 3. init backend
    initBackend(hook, bridge, window);
}

function getWebSocketBridge(ws: any) {
    const messageListeners: Function[] = [];

    ws.on('message', (event: MessageEvent) => {
        let data: any;
        try {
            if (typeof event.data === 'string') {
                data = JSON.parse(event.data);
            } else {
                throw Error();
            }
        } catch (e) {
            console.error(`[San DevTools] Failed to parse JSON: ${event.data}`);
            return;
        }
        messageListeners.forEach(fn => {
            try {
                fn(data);
            } catch (error) {
                // jsc doesn't play so well with tracebacks that go into eval'd code,
                // so the stack trace here will stop at the `eval()` call. Getting the
                // message that caused the error is the best we can do for now.
                console.log('[San DevTools] Error calling listener', data);
                console.log('error:', error);
                throw error;
            }
        });
    });

    return new Bridge({
        listen(fn: Function) {
            messageListeners.push(fn);
            return () => {
                const index = messageListeners.indexOf(fn);
                if (index >= 0) {
                    messageListeners.splice(index, 1);
                }
            };
        },
        send(data) {
            ws.sendRawMessage(JSON.stringify(data));
        }
    });
}
