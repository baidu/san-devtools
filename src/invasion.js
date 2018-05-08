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


function install() {
    switch (getContext()) {
        case CONTEXT_TYPE.BROWSER:
            installSanHook(window);
            break;
        case CONTEXT_TYPE.EXTENSION:
            fromContentScript(installSanHook.toString(), 'window');
            break;
    }
}


export function initHook(config = defaultConfig) {
    if (config !== defaultConfig) {
        setConfig(config);
    }
    switch (getContext()) {
        case CONTEXT_TYPE.BROWSER:
            const ns = getDevtoolNS();
            if (ns) {
                ns.initHook = initHook;
                ns._config = getConfig();
            }
            addSanEventListeners();
            addStoreEventListeners();
            break;
        case CONTEXT_TYPE.EXTENSION:
            fromContentScript(toStr(getConfig()), 'window', '_config');
            fromExtensionUrlSync(chrome.runtime.getURL('host_entry.js'));
            break;
    }
}


// First, install __san_devtool__ object.
install();

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
