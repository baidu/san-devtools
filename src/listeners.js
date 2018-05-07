/**
 * San DevTool Hook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file San and san-store listeners。
 */


import {SAN_EVENTS, STORE_EVENTS, COMP_ROUTE,
    __3_COMP__, __3_PATH__, __3_DATA__, __3_TREE_INDEX__, __3_INFO__}
        from './constants';
import {isBrowser, isExtension} from './context';
import {getDevtoolNS} from './utils';
import {serialize, getComponentPath, getComponentName, getHistoryInfo,
    getRouteInfo, getComponentTreeItemData} from './components';
import componentTreeBuilder from './tree_builder';
import stores from './stores';
import {getConfig} from './config';


if (isExtension()) {
    chrome.runtime.onMessage.addListener((message, sender, send) => {
        if (message.message === 'get_version') {
            window.postMessage({
                host: HOST,
                message: 'get_version'
            }, '*');
        }
    });
}

window.addEventListener('message', e => {
    if (e.data.host === HOST) {
        switch (e.data.message) {
            case 'version': {
                if (isExtension()) {
                    chrome.runtime.sendMessage({
                        message: 'version',
                        data: e.data.version
                    });
                }
                break;
            }
        }
    }
}, false);


// 将所有事件信息存入 history 数组，以便后续使用。
function buildHistory(component, root, message) {
    if (!root || !root['history']) {
        return null;
    }
    const info = getHistoryInfo(component, message);
    root['history'].unshift(info);
    return info;
}

function buildRoutes(component, root) {
    if (!root || !root['routes'] || !component || !component.data) {
        return null;
    }
    const info = getRouteInfo(component);
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
    const beforeFunc = getConfig().beforeStoreEventListener;
    typeof beforeFunc === 'function' && beforeFunc.bind(this)(getConfig());
    let sanDevtool = getDevtoolNS();
    if (!sanDevtool || typeof sanDevtool.store !== 'object') {
        return;
    }

    for (let message of STORE_EVENTS) {
        sanDevtool.on(message, (...args) => {
            const onMessageFunc = getConfig().onStoreMessage;
            if (typeof onMessageFunc === 'function') {
                if (onMessageFunc.call(this, message, ...args)) {
                    return;
                }
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
    const afterFunc = getConfig().afterStoreEventListener;
    typeof afterFunc === 'function' && afterFunc.bind(this)(getConfig());
}

function listenRouteEvent(ns) {
    ns.on(COMP_ROUTE, (...args) => {
        const data = buildRoutes(args[0], ns);
        if (ns.devtoolPanelCreated) {
            window.postMessage({...data, COMP_ROUTE}, '*');
        }
    });
}

function bindProperties(component, {idPath, compData, indexList}) {
    component.el[__3_COMP__] = component;
    component.el[__3_PATH__] = idPath;
    component.el[__3_DATA__] = compData;
    component.el[__3_TREE_INDEX__] = indexList;

    // 为提高效率在 get 的时候才生成数据。
    if (!component.el.hasOwnProperty(__3_INFO__)) {
        Object.defineProperty(component.el, __3_INFO__, {
            get() {
                return {
                    ...serialize(component),
                    idPath
                };
            }
        });
    }
}

function postMessageToExtension(ns, {
    message, id, idPath, oldIndexList, indexList, data
}) {
    if (ns.devtoolPanelCreated) {
        window.postMessage({
            message,
            id,
            idPath,
            oldIndexList,
            indexList,
            data,
            timestamp: Date.now(),
            componentName: getComponentName(component),
            compData: JSON.parse(JSON.stringify(compData))
        }, '*');
    }
}

// 注册所有 San 发送给 devtool 的 event listeners。
// 必须在页面上下文中执行。
// 必须在 window.__san_devtool__ 挂钩注册好后执行。
export function addSanEventListeners() {
    const beforeFunc = getConfig().beforeSanEventListener;
    typeof beforeFunc === 'function' && beforeFunc.bind(this)(getConfig());
    const sanDevtool = getDevtoolNS();
    if (!sanDevtool || typeof sanDevtool.data !== 'object') {
        return;
    }

    const builder = new componentTreeBuilder({root: sanDevtool.data.treeData});

    // 8 种事件。
    for (const message of SAN_EVENTS) {
        if (message === COMP_ROUTE) {
            return listenRouteEvent(sanDevtool);
        }
        sanDevtool.on(message, (...args) => {
            const onMessageFunc = getConfig().onSanMessage;
            if (typeof onMessageFunc === 'function') {
                if (onMessageFunc.call(this, message, ...args, getConfig())) {
                    return;
                }
            }
            // 默认第一个参数均为 Component 实例。
            const component = args[0];

            if (!component || !component.id || !component.el) {
                return;
            }

            const id = component.id;
            const idPath = getComponentPath(component);
            let data = getComponentTreeItemData(component);
            const treeDataGeneratorFunc = getConfig().treeDataGenerator;
            if (typeof treeDataGeneratorFunc === 'function') {
                let res = treeDataGeneratorFunc.call(this, message, ...args, getConfig());
                if (typeof res === 'object') {
                    data = {
                        ...data,
                        ...res
                    };
                }
            }
            const oldIndexList = builder.getIndexListByPath(idPath);
            component.idPath = data.idPath = idPath;
            buildHistory(component, sanDevtool, message);
            builder.emit(message, data);
            const indexList = builder.getIndexListByPath(idPath);
            const compData = component.data.raw || component.data.data;

            bindProperties(component, {idPath, compData, indexList});

            if (getConfig().hookOnly) {
                return;
            }

            // 只有当 devtool 面板创建之后才向 content script 发送组件信息。
            postMessageToExtension(sanDevtool,
                {message, id, idPath, oldIndexList, indexList, data});
        });
    }
    const afterFunc = getConfig().afterSanEventListener;
    typeof afterFunc === 'function' && afterFunc.bind(this)(getConfig());
}
