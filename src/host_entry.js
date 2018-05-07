/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Entry for extension context
 */


import {addSanEventListeners, addStoreEventListeners} from './listeners';
import {parseUrl, getDevtoolNS, toVar} from './utils';
import {setConfig, getConfig} from './config';


const ns = getDevtoolNS();
ns._config = toVar(JSON.stringify(ns._config));
setConfig(ns._config);

addSanEventListeners();
addStoreEventListeners();
