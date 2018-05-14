/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Hook.
 */


import {getDevtoolNS} from './utils';
import {getConfig} from './config';


/**
 * Backup initHook function for __san_devtool__.
 */
export function backupInitHook(func) {
    const ns = getDevtoolNS();
    if (ns) {
        ns.initHook = func;
    }
}


/**
 * Backup user's configuration for __san_devtool__._config.
 */
export function backupConfig() {
    const ns = getDevtoolNS();
    if (!ns) {
        return;
    }
    ns._config = getConfig();
}


/**
 * Intialize component tree's root key for __san_devtool__.data.
 */
export function initComponentTreeDataRoot() {
    const ns = getDevtoolNS();
    if (ns) {
        ns.data[getConfig().subKey] = [];
    }
}


/*eslint-disable*/
/**
 * Install __san_devtool__ namespace in global window.
 *
 * @param {Object} global   The global window.
 */
export function installSanHook(global) {
    const ns = SAN_DEVTOOL;
    if (global[ns]) {
        return;
    }
    const sanHook = {
        _config: null,
        _listeners: {},
        /* // 是否为第一次触发。
        _initialEmitting: false, */
        // 判断 devtool 面板是否打开。
        _devtoolPanelCreated: false,
        // 判定此挂钩的运行上下文。
        _this: null,
        // 由 San 传入的 san 对象。
        san: null,
        // 与 devtool 保持同步的组件树。
        data: {
            selectedComponentId: null
        },
        // 记录 San devtool 事件触发列表。
        history: [],
        historyIndexBeforeDevtoolPanelCreated: 0,
        routes: [],
        // Stores 对象及相关信息，与 devtool 保持同步的 mutation list。
        store: {
            stores: {},
            mutations: [],
            actions: [],
            treeData: []
        },
        sub: (event, func) => {
            sanHook.on(event, func);
            return () => sanHook.off(event, func);
        },
        on: (event, func) => {
            if (!sanHook._listeners[event]) {
                sanHook._listeners[event] = [];
            }
            sanHook._listeners[event].push(func);
        },
        off: (event, func) => {
            if (!sanHook._listeners[event]) {
                return;
            }
            let index = sanHook._listeners[event].indexOf(func);
            if (index !== -1) {
                sanHook._listeners[event].splice(index, 1);
            }
            if (!sanHook._listeners[event].length) {
                sanHook._listeners[event] = null;
            }
        },
        emit: (event, data) => {
            /* // 兼容 San 3.1.3 以前的版本。在 3.1.3 之后仅挂在到 window 对象上。
            if (!sanHook._initialEmitting && event === 'san') {
                if (sanHook._this === window) {
                    delete Object.prototype[SAN_DEVTOOL];
                }
                sanHook._initialEmitting = true;
            }*/
            if (sanHook._listeners[event]) {
                sanHook._listeners[event].map(func => func(data));
            }
        }
    };

    function sendVersion(version) {
        window.postMessage({
            host: HOST,
            message: 'version',
            version
        }, '*');
    }

    sanHook.on('san', san => {
        if (!sanHook.san && san) {
            sanHook.san = san;
        };
        sendVersion(san.version);
        window.addEventListener('message', e => {
            if (e.data.host === HOST) {
                if (e.data.message === 'get_version') {
                    sendVersion(san.version);
                }
            }
        });
    });

    // FIXME
    const defineProperty = ({}).constructor.defineProperty;
    const hookAccessor = {
        configurable: true,
        get() {
            sanHook._this = this;
            return sanHook;
        }
    };
    // Stop supporting older San.
    // defineProperty(Object.prototype, SAN_DEVTOOL, hookAccessor);
    defineProperty(window.constructor.prototype, ns, hookAccessor);
}

/*eslint-enable*/
