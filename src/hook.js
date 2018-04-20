/**
 * San DevTool Hook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Hook.
 */


export function installSanHook(global) {
    if (global[SAN_DEVTOOL]) {
        return;
    }
    const sanHook = {
        _listeners: {},
        // 是否为第一次触发。
        _initialEmitting: false,
        // 判断 devtool 面板是否打开。
        _devtoolPanelCreated: false,
        // 判定此挂钩的运行上下文。
        _this: null,
        // 由 San 传入的 san 对象。
        san: null,
        // 与 devtool 保持同步的组件树。
        data: {
            selectedComponentId: null,
            treeData: []
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
            var index = sanHook._listeners[event].indexOf(func);
            if (index !== -1) {
                sanHook._listeners[event].splice(index, 1);
            }
            if (!sanHook._listeners[event].length) {
                sanHook._listeners[event] = null;
            }
        },
        emit: (event, data) => {
            // 兼容 San 3.1.3 以前的版本。在 3.1.3 之后仅挂在到 window 对象上。
            if (!sanHook._initialEmitting && event === 'san') {
                if (sanHook._this === window) {
                    delete Object.prototype[SAN_DEVTOOL];
                }
                sanHook._initialEmitting = true;
            }
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
    let defineProperty = ({}).constructor.defineProperty;
    let hookAccessor = {
        configurable: true,
        get() {
            sanHook._this = this;
            return sanHook;
        }
    };
    defineProperty(Object.prototype, SAN_DEVTOOL, hookAccessor);
    defineProperty(window.constructor.prototype, SAN_DEVTOOL, hookAccessor);
}
