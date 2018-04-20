/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Invasion and entry for browser context.
 */


import {defaultConfig, setConfig} from './config';
import {getContext, CONTEXT_TYPE, isExtension} from './context';
import {installSanHook} from './hook';
import injector from './injector';
import {addSanEventListeners, addStoreEventListeners} from './listeners';
import {parseUrl, getDevtoolNS} from './utils';


const AUTO_HOOK = 'autohook';


export function initHook(config = defaultConfig) {
    if (config !== defaultConfig) {
        setConfig(config);
    }
    switch (getContext()) {
        case CONTEXT_TYPE.BROWSER:
            addSanEventListeners();
            addStoreEventListeners();
            break;
        case CONTEXT_TYPE.EXTENSION:
            injector.fromContentScript(installSanHook.toString(), 'window');
            injector.fromExtensionUrlSync(chrome.runtime.getURL('host_entry.js'));
            break;
    }
}


if (getContext() === CONTEXT_TYPE.BROWSER) {
    installSanHook(window);
    if (getDevtoolNS()) {
        getDevtoolNS().initHook = initHook;
    }
}

if (typeof location === 'object' && AUTO_HOOK in parseUrl(location.href)) {
    initHook();
}
else if (document.currentScript && AUTO_HOOK in parseUrl(document.currentScript.src)) {
    initHook();
}
