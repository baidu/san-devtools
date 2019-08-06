/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file San and san-store listeners。
 */


import {SAN_EVENTS, STORE_EVENTS, SAN_PROPERTIES} from './constants';
import {getDevtoolNS, executeCallback, tryToRetrieveRoot} from './utils';
import CNode from './component';
import ComponentTreeBuilder from './component_tree_builder';
import stores from './stores';
import {getConfig} from './config';
import {getFunctionList, showTree, DEFAULT_CONSOLE_OPTIONS} from './console';


const [
    COMP_COMPILED,
    COMP_INITED,
    COMP_CREATED,
    COMP_ATTACHED,
    COMP_DETACHED,
    COMP_DISPOSED,
    COMP_UPDATED,
    COMP_ROUTE
] = SAN_EVENTS;
const [
    STORE_DEFAULT_INITED,
    STORE_CONNECTED,
    STORE_COMP_INITED,
    STORE_COMP_DISPOSED,
    STORE_LISTENED,
    STORE_UNLISTENED,
    STORE_DISPATCHED,
    STORE_ACTION_ADDED
] = STORE_EVENTS;
const [
    __3_COMP__,
    __3_PATH__,
    __3_DATA__,
    __3_PROPS__,
    __3_INDEX_LIST__,
    __3_CNODE__
] = SAN_PROPERTIES;

const blackSanEvent = [COMP_COMPILED, COMP_INITED, COMP_CREATED, COMP_DISPOSED];


/**
 * Build the history list and return the latest info.
 * @inner
 *
 * @param {CNode} cnode     The CNode instance.
 * @param {Array} root      The __san_devtool__ namespace.
 * @param {string} message  The event name.
 * @return {Object}
 */
function buildHistory(cnode, root, message) {
    if (!root || !root['history']) {
        return null;
    }

    const info = {...cnode.history, message};

    root['history'].unshift(info);
    return info;
}


/**
 * Build the route list and return the latest info.
 * @inner
 *
 * @param {CNode} cnode     The CNode instance.
 * @param {Array} root      The __san_devtool__ namespace.
 * @return {Object}
 */
function buildRoutes(cnode, root) {
    if (!root || !root['routes'] || !CNode.isCNode(cnode)) {
        return null;
    }
    const info = cnode.route;
    info.relatived = cnode;
    root['routes'].unshift(info);
    return info;
}


function getStoreName(devtool, store) {
    if (!devtool || !devtool.store || !devtool.store.stores || !store) {
        return;
    }
    for (let k in devtool.store.stores) {
        if (store === devtool.store.stores[k]) {
            return k;
        }
    }
    return null;
}

export function addStoreEventListeners(callback) {
    const config = getConfig();

    executeCallback('onBeforeListenStore', this, config);

    let sanDevtool = getDevtoolNS();
    if (!sanDevtool || typeof sanDevtool.store !== 'object') {
        return;
    }

    for (let message of STORE_EVENTS) {
        sanDevtool.on(message, (...args) => {
            if (executeCallback('onStoreMessage', this, message, ...args,
                    config)) {
                return;
            }

            switch (message) {
                case 'store-connected': {
                    let {store, mapStates, mapActions} = args[0];
                    if (!store) {
                        return;
                    }
                    let name = store.name;
                    store.isDefault = store.name === '__default__';
                    if (!store) {
                        return;
                    }
                    if (name) {
                        let has = !!sanDevtool.store.stores[name];
                        if (!has) {
                            sanDevtool.store.stores[name] = store;
                        }
                    } else {
                        let n = getStoreName(sanDevtool, store);
                        if (n) {
                            return;
                        }
                        let len = Object.keys(sanDevtool.store.stores).length;
                        store.name = 'Store' + len;
                        sanDevtool.store.stores['Store' + len] = store;
                    }
                    break;
                }
                case 'store-comp-inited': {
                    let {store, component} = args[0];
                    if (!store || !component) {
                        return;
                    }
                    store.components = store.components || {};
                    store.components[component.id] = component;
                    component.store = store;
                    break;
                }
                case 'store-comp-disposed': {
                    let {store, component} = args[0];
                    if (!store) {
                        return;
                    }
                    delete store.components[component.id];
                    delete component.store;
                    break;
                }
                case 'store-action-added':
                    sanDevtool.store.actions.push(args[0]);
                    break;
                case 'store-dispatched': {
                    let data = {
                        ...args[0],
                        timestamp: Date.now()
                    };
                    stores.processMutationData(data.diff);
                    sanDevtool.store.mutations.unshift(data);
                    stores.updateMutationList(sanDevtool.store, data);
                    break;
                }
                // 替代方案，当使用非官方 connector 并且没有在 connector 中向 devtool
                // 发送相应的时间的时候有效。
                case 'store-default-inited': {
                    let store = args[0].store;
                    if (!store) {
                        return;
                    }
                    store.isDefault = true;
                    if (!store.name) {
                        store.name = '__default__';
                    }
                    break;
                }
                case 'store-listened': {
                    if (Object.keys(sanDevtool.store.stores).length > 0) {
                        return;
                    }
                    let {store, listener} = args[0];
                    if (!store || !listener) {
                        return;
                    }
                    let name = getStoreName(sanDevtool, store);
                    if (name) {
                        return;
                    }
                    let len = Object.keys(sanDevtool.store.stores).length;
                    if (!store.name && !store.isDefault) {
                        store.name = 'Store' + len;
                    }
                    sanDevtool.store.stores[store.name] = store;
                    break;
                }
                case 'store-unlistened': {
                    if (Object.keys(sanDevtool.store.stores).length > 0) {
                        return;
                    }
                    break;
                }
            }

            if (sanDevtool.devtoolPanelCreated) {
                if (e === 'store-dispatched') {
                    window.postMessage({
                        message,
                        ...sanDevtool.store.treeData[0]
                    }, '*');
                }
            }
        });
    }

    executeCallback('onAfterListenStore', this, config);
}


/**
 * Listen the San route event.
 * @inner
 */
function listenRouteEvent() {
    const ns = getDevtoolNS();
    ns.on(COMP_ROUTE, (...args) => {
        const data = buildRoutes(new CNode(args[0]), ns);
        if (ns.devtoolPanelCreated) {
            window.postMessage({...data, COMP_ROUTE}, '*');
        }
    });
}

/**
 * Bind some DOM properties for user's debugging.
 * @inner
 *
 * @param {CNode} node           The CNode instance.
 * @param {Component} component   The San Component instance.
 */
function bindProperties(node, component, config) {
    const el = component.el;

    el[__3_COMP__] = component;
    el[__3_PATH__] = node.ancestorPath;
    el[__3_DATA__] = node.data;
    el[__3_PROPS__] = node.props;
    el[__3_INDEX_LIST__] = node.ancestorIndexList;
    el[__3_CNODE__] = node;

    node.showTree = el['showTree'] = () => showTree(Object.assign({}, DEFAULT_CONSOLE_OPTIONS, {node}));
    el['functionList'] = getFunctionList(node);

    if (config.prefixForBindingData) {
        Object.keys(node.data).forEach(k => {
            try {
                el.dataset[`${config.prefixForBindingData}${k}`]
                    = JSON.stringify(node.data[k]);
            } catch (ex) {
                let prefix = config.prefixForBindingData.replace(/-/g, '');
                el.dataset[`${prefix}${k}`] = JSON.stringify(node.data[k]);
            }
        });
        node.props.forEach(({key, value}) => {
            try {
                el.dataset[`props_${config.prefixForBindingData}${key}`]
                    = JSON.stringify(value);
            } catch (ex) {
                let prefix = config.prefixForBindingData.replace(/-/g, '');
                el.dataset[`props_${prefix}${key}`] = JSON.stringify(value);
            }
        });
    }
}


/**
 * Post CNode with message to content script.
 * @inner
 *
 * @param {Object} ns                The __san_devtool__ namespace.
 * @param {string} options.message   The San event name.
 * @param {CNode}  options.cnode     The CNode instance.
 */
function postMessageToExtension(ns, {message, cnode}) {
    if (ns.devtoolPanelCreated) {
        window.postMessage({
            message,
            cnode,
            timestamp: Date.now(),
        }, '*');
    }
}


/**
 * Listen all San events.
 * @inner
 */
export function addSanEventListeners() {
    const config = getConfig();

    executeCallback('onBeforeListenSan', this, getConfig());

    const sanDevtool = getDevtoolNS();
    if (!sanDevtool || typeof sanDevtool.data !== 'object') {
        return;
    }

    const builder = new ComponentTreeBuilder({
        root: sanDevtool.data[config.subKey]
    });

    // COMP_XXX events
    for (const message of SAN_EVENTS) {
        if (message === COMP_ROUTE) {
            listenRouteEvent();
            return;
        }
        sanDevtool.on(message, component => {
            if (!component || !component.id || !component.el) {
                return;
            }

            // Create a CNode from component instance.
            let cnode = new CNode(component, {
                subKey: config.subKey,
                root: sanDevtool.data[config.subKey],
                message
            });

            if (executeCallback('onSanMessage', this, message,
                    cnode.serialize(), cnode.parentId, component, true, config)) {
                return;
            }

            if (message === COMP_CREATED) {
                component.el.dataset['san_id'] = component.id;
            }

            buildHistory(cnode, sanDevtool, message);

            if (blackSanEvent.indexOf(message) >= 0) {
                return;
            }

            cnode.parseANode();
            cnode.seekAncestor();

            cnode.merge(
                executeCallback(
                    'onGenerateData', this, message, cnode.serialize(),
                        cnode.parentId, component, config));

            cnode.simplify();

            bindProperties(cnode, component, config);

            // Emit to TreeBuilder to update component tree.
            builder.emit(message, cnode);

            executeCallback('onAfterGenerateData', this, message,
                cnode.serialize(), cnode.parentId, component, config);

            if (message === COMP_ATTACHED) {
                tryToRetrieveRoot(cnode, component, config);
            }

            if (!getConfig().hookOnly) {
                // Only post message after devtool panel created.
                postMessageToExtension(sanDevtool, {message, cnode});
            }

        });
    }

    executeCallback('onAfterListenSan', this, config);
}
