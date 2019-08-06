/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Conditions for listeners.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {getDevtoolNS} from './utils';
import {getConfig} from './config';


function setListenersTriggered(value, listenerName) {
    const ns = getDevtoolNS();
    if (!ns || !ns.listenersTriggered) {
        return;
    }
    const listenersTriggered = ns.listenersTriggered;
    ns.listenersTriggered = Object.assign(listenersTriggered,
        generateListenerTriggered(listenersTriggered, value, listenerName));
}


/**
 * Generate listenerTriggered object.
 *
 * @param {Object} config  User configuration or listenerTriggered object
 * @param {boolean} value  True or false
 * @param {Object} listenerName  Listener name to be set, or setting all the
 *                               listeners if empty.
 * @return {Object}
 */
export function generateListenerTriggered(config, value, listenerName) {
    return config
        ? Object.assign.apply(Object, Object.keys(config)
            .filter(k => listenerName ? k === listenerName : k.startsWith('on'))
            .map(v => ({[v]: value})))
        : {};
}


/**
 * Register listeners triggering conditions.
 *
 * @param {Object} config  User configuration
 */
export function registerConditions(config) {
    const conditions = config.conditions;
    const ns = getDevtoolNS();
    if (!ns || !Array.isArray(conditions) || conditions.length < 1) {
        return;
    }

    setListenersTriggered(false);
    conditions.forEach(condition => {
        let {event, target = window, listeners = []} = condition;
        if (!target) {
            return;
        }
        target.addEventListener(event, e => {
            // Ignore empty
            if (listeners.length === 0) {
                setListenersTriggered(true);
            }
            listeners.forEach(listener => {
                if (typeof listener === 'string') {
                    setListenersTriggered(true, listener);
                }
                else if (typeof listener === 'function') {
                    listener(e);
                }
            });

        });
    });
}
