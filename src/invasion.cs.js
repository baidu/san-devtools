/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Invasion and entry for content script context.
 */


import {defaultConfig, setConfig, getConfig} from './config';
import {installSanHook} from './hook';
import {fromContentScript, fromExtensionUrlSync} from './injector';
import {parseUrl, toStr} from './utils';


/* globals sanDevHook */
/* globals chrome */


const AUTO_HOOK = 'autohook';


function install() {
    fromContentScript(installSanHook.toString(), 'window');
}


export function initHook(config = defaultConfig) {
    if (config !== defaultConfig) {
        setConfig(config);
    }
    fromContentScript(toStr(getConfig()), 'window', '_config');
    fromExtensionUrlSync(chrome.runtime.getURL('host_entry.js'));
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
