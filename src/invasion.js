/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Invasion and entry for browser context.
 */


import {defaultConfig, setConfig, getConfig} from './config';
import {getContext, CONTEXT_TYPE, isExtension} from './context';
import {installSanHook} from './hook';
import {fromContentScript, fromExtensionUrlSync} from './injector';
import {addSanEventListeners, addStoreEventListeners} from './listeners';
import {parseUrl, getDevtoolNS, toStr, toVar} from './utils';


/* globals sanDevHook */
/* globals chrome */


const AUTO_HOOK = 'autohook';


export function initHook(config = defaultConfig) {
    const ns = getDevtoolNS();
    if (config !== defaultConfig) {
        setConfig(config);
    }
    switch (getContext()) {
        case CONTEXT_TYPE.BROWSER:
            installSanHook(window);
            if (ns) {
                ns.initHook = initHook;
            }
            addSanEventListeners();
            addStoreEventListeners();
            break;
        case CONTEXT_TYPE.EXTENSION:
            fromContentScript(installSanHook.toString(), 'window');
            fromContentScript(toStr(getConfig()), 'window', '_config');
            fromExtensionUrlSync(chrome.runtime.getURL('host_entry.js'));
            break;
    }
}


// Auto hook
let currentScript = document.currentScript;
if (typeof location === 'object' && AUTO_HOOK in parseUrl(location.href)) {
    initHook();
}
else if (currentScript && AUTO_HOOK in parseUrl(currentScript.src)) {
    initHook();
}
else if (typeof sanDevHook === 'object' && sanDevHook.autohook) {
    initHook(sanDevHook.config);
}
