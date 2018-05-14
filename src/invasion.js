/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Invasion and entry for browser context.
 */


import {defaultConfig, setConfig, getConfig} from './config';
import {installSanHook, backupInitHook, backupConfig, initComponentTreeDataRoot} from './hook';
import {addSanEventListeners, addStoreEventListeners} from './listeners';
import {parseUrl} from './utils';


/* globals sanDevHook */
/* globals chrome */


const AUTO_HOOK = 'autohook';


export function initHook(config = defaultConfig) {
    if (config !== defaultConfig) {
        setConfig(config);
    }
    initComponentTreeDataRoot();
    addSanEventListeners();
    addStoreEventListeners();
}


// First, install __san_devtool__ object.
installSanHook(window);
backupInitHook(initHook);
backupConfig();

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
