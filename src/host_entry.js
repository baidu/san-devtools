/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Entry for extension context
 */


import {addSanEventListeners, addStoreEventListeners} from './listeners';
import {tsConfig} from './config';


tsConfig();

addSanEventListeners();
addStoreEventListeners();
