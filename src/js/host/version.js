/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Version number processing center.
 */

import Messenger from 'chrome-ext-messenger';

import utils from '../common/utils';

export function detectSan(global) {
    global.document.addEventListener('DOMContentLoaded', () => {
        if (!global || !global[SAN_DEVTOOL] || !global[SAN_DEVTOOL].san) {
            return;
        }
        global.postMessage({
            sanVersion: global[SAN_DEVTOOL].san.version
        }, '*');
    });
}

export const version = {

    getVersionNumberFromPage(callback) {
        window.addEventListener('message', e => {
            if (e.data) {
                // Store version number in content script context for the page.
                window.sanVersion =
                    utils.normalizeVersionNumber(e.data && e.data.sanVersion);
                callback.bind(this)(window.sanVersion);
            }
        });
    }

};

