/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file 页面注入脚本入口
 */

import constants from '../common/constants';
import utils from '../common/utils';
import version from './version';
import components from './components';
import listeners from './listeners';
import highlighter from './highlighter';

// 布置 San 版本监听器
version.detectSan();

// 布置 San devtool 监听器
listeners.addSanEventListeners();
// 布置 Store 监听器
listeners.addStoreEventListeners();
