/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Configuration
 * @author luyuan<luyuan.china@gmail.com>
 */


import {SUB_KEY, NOOP} from './constants';
import {getDevtoolNS, toVar} from './utils';
import {isExtension} from './context';


const NOOP_FUNC_OR_STRING = isExtension() ? NOOP + '' : NOOP;


export const defaultConfig = {
    hookOnly: false,
    subKey: SUB_KEY,
    treeDataGenerator: NOOP_FUNC_OR_STRING,
    beforeSanEventListener: NOOP_FUNC_OR_STRING,
    onSanMessage: NOOP_FUNC_OR_STRING,
    afterSanEventListener: NOOP_FUNC_OR_STRING,
    beforeStoreEventListener: NOOP_FUNC_OR_STRING,
    onStoreMessage: NOOP_FUNC_OR_STRING,
    afterStoreEventListener: NOOP_FUNC_OR_STRING
};


let config = {...defaultConfig};


export function getConfig() {
    return config;
}


export function setConfig(c) {
    if (!c || typeof c !== 'object') {
        return;
    }
    config = Object.assign(config, c);
}


export function tsConfig() {
    const ns = getDevtoolNS();
    if (!ns) {
        return;
    }
    if (typeof ns._config === 'object') {
        ns._config = toVar(JSON.stringify(ns._config));
        setConfig(ns._config);
    }
    else {
        ns._config = getConfig();
    }
}
