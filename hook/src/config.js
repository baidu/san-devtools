/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Configuration
 * @author luyuan<luyuan.china@gmail.com>
 */


import {SUB_KEY, DOM_CHILDREN_KEY, NOOP} from './constants';

export const defaultConfig = {
    hookOnly: true,
    subKey: SUB_KEY,
    domChildrenKey: DOM_CHILDREN_KEY,
    simplifiedCNode: false,
    prefixForBindingData: '',
    conditions: [],
    onBeforeListenSan: NOOP,
    onAfterListenSan: NOOP,
    onSanMessage: NOOP,
    onGenerateData: NOOP,
    onAfterGenerateData: NOOP,
    onBeforeListenStore: NOOP,
    onAfterListenStore: NOOP,
    onStoreMessage: NOOP,
    onRetrieveData: NOOP,
    onRootReady: NOOP,
    onSan: NOOP
};


let config = {...defaultConfig};


/**
 * Retrieve user's configuration object.
 *
 * @return {Object}
 */
export function getConfig() {
    return config;
}


/**
 * Save the user's configuration.
 *
 * @param {Object} c  Customized configuration.
 */
export function setConfig(c) {
    if (!c || typeof c !== 'object') {
        return;
    }
    Object.assign(config, c);
}
