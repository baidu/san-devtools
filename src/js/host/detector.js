/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file 版本检测。
 */

import highlighter from './highlighter';

// DOMContentLoaded 时将版本信息发送给 content script。
export default function (global = window) {
    global.document.addEventListener('DOMContentLoaded', () => {
        if (!global || !global[SAN_DEVTOOL] || !global[SAN_DEVTOOL].san) {
            return;
        }
        highlighter.init();
        global.postMessage({
            message: 'version',
            sanVersion: global[SAN_DEVTOOL].san.version
        }, '*');
    });
}
