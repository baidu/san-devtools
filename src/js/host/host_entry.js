/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file 页面注入脚本入口
 */

import detectSan from './detector';
import listeners from './listeners';

// 布置 San 版本监听器
detectSan();

// 布置 San devtool 监听器
listeners.addSanEventListeners();
// 布置 Store 监听器
listeners.addStoreEventListeners();
