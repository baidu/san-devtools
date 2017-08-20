/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Content script 入口，注入 hook 脚本。
 */

import injector from './injector';
import {installSanHook} from './hook';
import interchange from './interchange';
import version from './version';
import highlighter from './highlighter';

// 将 hook 对象挂在到 window.__san_devtool__ 上。此代码应该尽早的执行。
injector.fromContentScript(installSanHook.toString(), 'window');

// 将需要挂在到 window.__san_devtool__ 上的脚本入口文件引入到页面上。并布置 san 的
// listeners。
injector.fromContentScriptURL(
    chrome.runtime.getURL('js/host/host_entry.min.js')
).then(() => {
    /*injector.fromContentScript(function () {
        window[SAN_DEVTOOL].listeners.addSanEventListeners();
    }, 'window');*/
    //highlighter.init();
});

// 布置监听器将版本信息传递给 background。
version.init();

// 布置监听器用于中转由页面发往 devtool 的 San 事件。
interchange.init();


