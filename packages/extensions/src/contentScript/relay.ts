/* global chrome */
/**
 * @file 中继站，页面 backend 与 contentScript 之间的中继
 */

export function relay() {
    //  TODO: background.js 中监听该connect触发的链接事件
    const port = chrome.runtime.connect({
        name: 'content-script'
    });

    // 1. page backend.js ----> background.js

    /**
     * 监听页面 backend.js 发过来的消息，并转发到 background
     * @param evt backend.js 发过来的消息事件
     */
    function handleMessageFromPage(evt: MessageEvent) {
        if (evt.source === window && evt.data && evt.data.source === 'san-devtools-bridge') {
            port.postMessage(evt.data.payload);
        } else if (evt.source === window && evt.data && evt.data.source === 'san-detector') {
            chrome.runtime.sendMessage({
                event: 'HandShake.backendReady',
                version: evt.data.payload
            });
        }
    }
    window.addEventListener('message', handleMessageFromPage);

    // 2. background.js ----> page backend.js

    /**
     * 将 background 传过来的消息转发到页面
     * 握手请用 HandShake.frontendReady
     * @param message background 传过来的消息
     */
    function handleMessageFromDevtools(message: any) {
        window.postMessage(
            {
                source: 'san-devtools-content-script',
                payload: message
            },
            '*'
        );
    }
    port.onMessage.addListener(handleMessageFromDevtools);

    // 3. 断开链接清理
    function handleDisconnect() {
        window.removeEventListener('message', handleMessageFromPage);
    }
    port.onDisconnect.addListener(handleDisconnect);
}
