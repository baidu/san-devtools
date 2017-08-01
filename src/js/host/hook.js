/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Hook the webpage
 */

export function installSanHook(global) {
    if (global[SAN_DEVTOOL]) {
        return;
    }
    const sanHook = {
        _listeners: {},
        san: null,
        tree: {},
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
            //console.log('emit', event, data, data.el)
            if (sanHook._listeners[event]) {
                sanHook._listeners[event].map(func => func(data));
            }
        }
    };

    sanHook.on('san', san => {
        !sanHook.san && san && (sanHook.san = san);
    });

    // FIXME: try to use buble.
    window.eval('Object.defineProperty')(Object.prototype, SAN_DEVTOOL, {
        get() {
            return sanHook;
        },
    });
}
