/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Configuration
 * @author luyuan<luyuan.china@gmail.com>
 */


import {SUB_KEY, NOOP} from './constants';

export const defaultConfig = {
    hookOnly: false,
    subKey: SUB_KEY,
    treeDataGenerator: NOOP,
    beforeSanEventListener: NOOP,
    onSanMessage: NOOP,
    afterSanEventListener: NOOP,
    beforeStoreEventListener: NOOP,
    onStoreMessage: NOOP,
    afterStoreEventListener: NOOP
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
    config = Object.assign(config, c);
}
