/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Hook.
 */


import {getDevtoolNS} from './utils';
import {getConfig, defaultConfig} from './config';
import {getConstants, NOOP} from './constants';
import {generateListenerTriggered} from './conditions';
import {showTree, DEFAULT_CONSOLE_OPTIONS} from './console';


function hookAttach(ns) {
    if (!ns || !ns.san) {
        return;
    }
    const attach = ns.san.Component.prototype.attach;
    ns.san.Component.prototype.attach = function (...args) {
        this._attachedParentElement = args[0];
        this._attachedBeforeElement = args[1];
        attach.bind(this)(...args);
    };
}

/**
 * Backup initHook function for __san_devtool__.
 *
 * @param {Function} func   The initHook function.
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
export function initDataRoot() {
    const ns = getDevtoolNS();
    if (ns) {
        ns.data[getConfig().subKey] = [];
    }
}


/**
 * Trigger 'onSan' message to send 'san' object.
 *
 * @param {string} sender   'san' or 'initHook.
 */
export function emitSan(sender) {
    const config = getConfig();
    const ns = getDevtoolNS();
    if (!config || !ns || !ns.san || ns._sanEmitted || config.onSan === NOOP) {
        return;
    }
    config.onSan(ns.san, sender);
    ns._sanEmitted = true;
}


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
        _constants: getConstants(),
        _listeners: {},
        _devtoolPanelCreated: false,
        _sanEmitted: false,
        _this: null,
        san: null,
        data: {
            id: 'root',
            getSubKey() {
                return sanHook._config && this[sanHook._config.subKey];
            }
        },
        history: [],
        historyIndexBeforeDevtoolPanelCreated: 0,
        routes: [],
        store: {
            stores: {},
            mutations: [],
            actions: [],
            treeData: []
        },
        listenersTriggered: generateListenerTriggered(defaultConfig, true),
        showTree: (options = DEFAULT_CONSOLE_OPTIONS) => showTree(
            Object.assign({}, DEFAULT_CONSOLE_OPTIONS, {node: sanHook.data}, options)),
        retrieveData: (...args) => {
            const config = getConfig();
            const callback = config.onRetrieveData;
            if (typeof callback !== 'function') {
                return;
            }

            let tree = Object.assign([], sanHook.data);
            let indexList;
            if (args.length < 1) {
                callback(tree[config.subKey]);
                return;
            }
            if (typeof args[0] === 'number') {
                indexList = args.map(e => e | 0);
            }
            else if (Array.isArray(args[0])) {
                indexList = args[0]
            }
            else {
                return;
            }

            try {
                const cnode = indexList.reduce((a, v) => typeof a === 'object'
                    ? a[config.subKey][v]
                        : tree[config.subKey][a][config.subKey][v])
                callback(cnode);
            }
            catch (ex) {
                callback();
            }
        },
        getData: () => Object.assign([], sanHook.data[getConfig().subKey]),

        once: (event, func) => {
            const onFunc = (...args) => {
                sanHook.off(event, onFunc);
                if (typeof func === 'function') {
                    func.apply(sanHook, args);
                }
            }
            sanHook.on(event, onFunc);
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
            if (sanHook._listeners[event]) {
                sanHook._listeners[event].map(func => func(data));
            }
        }
    };

    sanHook.on('san', san => {
        if (!sanHook.san && san) {
            sanHook.san = san;
            hookAttach(sanHook);
        }
        emitSan('san');
    });

    const hookAccessor = {
        configurable: true,
        get() {
            sanHook._this = this;
            return sanHook;
        }
    };
    Object.defineProperty(window, ns, hookAccessor);
}
