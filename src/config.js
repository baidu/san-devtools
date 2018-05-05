/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Configuration
 * @author luyuan<luyuan.china@gmail.com>
 */


import {SUB_KEY, NOOP} from './constants';
import {getDevtoolNS, toVar} from './utils';


const NOOP_STR = NOOP + '';


export const defaultConfig = {
    hookOnly: false,
    subKey: SUB_KEY,
    treeDataGenerator: NOOP_STR,
    beforeSanEventListener: NOOP_STR,
    onSanMessage: NOOP_STR,
    afterSanEventListener: NOOP_STR,
    beforeStoreEventListener: NOOP_STR,
    onStoreMessage: NOOP_STR,
    afterStoreEventListener: NOOP_STR
};


let config = {...defaultConfig};


export function getConfig() {
    /*if (!getDevtoolNS()) {
        return config;
    }
    return toVar(getDevtoolNS()._config || config);*/
    return config;
}


export function setConfig(c) {
    if (!c || typeof c !== 'object') {
        return;
    }
    config = Object.assign(config, c);
}


