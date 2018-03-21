/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file San 事件注册。
 */

import _ from 'lodash';

import constants from '../common/constants';
import utils from '../common/utils';
import components from './components';
import stores from './stores';

// 获得 devtool 显示组件树所需要的组件的信息。
let getComponentTreeItemData = component => ({
    id: component.id,
    text: '<' + getComponentName(component) + '>',
    component: {
        name: getComponentName(component),
        id: component.id,
        data: component.data.raw || component.data.data,
        class: component.el.className,
        style: component.el.style.cssText
    },
    secondaryText: component.id,
    identity: component.id,
    extras: [getComponentRouteExtraData(component)],
    idPath: component.idPath
});

// 生成组件的路径。
let generatePath = component => components.getComponentPath(component);

// 生成历史记录信息。
let getHistoryInfo = (component, message) => ({
    id: component.id,
    idPath: component.idPath,
    componentName: getComponentName(component),
    timestamp: Date.now(),
    compData: component.el['__san_data__'],
    message
});

// 生成路由信息。
let getRouteInfo = component => ({
    id: component.id,
    timestamp: Date.now(),
    routeData: component.data.get('route')
        ? JSON.parse(JSON.stringify(component.data.get('route')))
            : undefined
});

// 将所有事件信息存入 history 数组，以便后续使用。
function buildHistory(component, root, message) {
    if (!root || !root['history']) {
        return null;
    }
    let info = getHistoryInfo(component, message);
    root['history'].unshift(info);
    return info;
}

function buildRoutes(component, root) {
    if (!root || !root['routes'] || !component || !component.data) {
        return null;
    }
    let info = getRouteInfo(component);
    root['routes'].unshift(info);
    return info;
}

function getComponentName(component) {
    let name = component && (component.subTag || component.constructor.name);
    if (!name || name.length === 1) {
        name = component ? component.tagName : 'Component';
    }
    return name;
}

function getComponentRouteData(component) {
    let data = getRouteInfo(component);
    return data.routeData ? 'Route:' + data.routeData.path : '';
}

function getComponentRouteExtraData(component) {
    let data = getRouteInfo(component);
    return data.routeData ? {
        icon: 'navigation',
        text: getComponentRouteData(component)
    } : null;
}

function getDevtoolNS() {
    if (!utils.isBrowser()) {
        return;
    }
    let global = window;
    if (!global || !_.isObject(global[SAN_DEVTOOL])) {
        return null;
    }
    return global[SAN_DEVTOOL];
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

function addStoreEventListeners() {
    let sanDevtool = getDevtoolNS();
    if (!sanDevtool || !_.isObject(sanDevtool.store)) {
        return;
    }

    if (!_.isArray(sanDevtool.store.actions)
        || !_.isArray(sanDevtool.store.mutations)
        || !_.isObject(sanDevtool.store.stores)) {
        return;
    }

    for (let e of constants.storeEventNames) {
        sanDevtool.on(e, (...args) => {
            switch (e) {
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
                        message: e,
                        ...sanDevtool.store.treeData[0]
                    }, '*');
                }
            }
        });
    }
}

// 注册所有 San 发送给 devtool 的 event listeners。
// 必须在页面上下文中执行。
// 必须在 window.__san_devtool__ 挂钩注册好后执行。
function addSanEventListeners() {
    let sanDevtool = getDevtoolNS();
    if (!sanDevtool || !_.isObject(sanDevtool.store)) {
        return;
    }

    // 8 种事件。
    for (let message of constants.sanEventNames) {
        sanDevtool.on(message, (...args) => {
            // 默认第一个参数均为 Component 实例。
            const component = args[0];

            if (!component || !component.id) {
                return;
            }

            let id = component.id;

            if (message === 'comp-route') {
                let data = buildRoutes(args[0], sanDevtool);
                if (sanDevtool.devtoolPanelCreated) {
                    window.postMessage({...data, message}, '*');
                }
                return;
            }

            if (!component.el) {
                return;
            }

            let idPath = generatePath(component);
            let data = getComponentTreeItemData(component);
            let oldIndexList = components.getIndexListFromPathAndTreeData(idPath,
                sanDevtool['data'].treeData);
            component.idPath = data.idPath = idPath;

            buildHistory(component, sanDevtool, message);
            components.updatePrimitiveTree(data, message, sanDevtool['data']);
            let indexList = components.getIndexListFromPathAndTreeData(idPath,
                sanDevtool['data'].treeData);
            let compData = component.data.raw || component.data.data;

            component.el['__san_component__'] = component;
            component.el['__san_path__'] = idPath;
            component.el['__san_data__'] = compData;
            component.el['__san_tree_index__'] = indexList;

            // 为提高效率在 get 的时候才生成数据。
            if (!component.el.hasOwnProperty('__san_info__')) {
                Object.defineProperty(component.el, '__san_info__', {
                    get() {
                        return {
                            ...components.serialize(component),
                            idPath
                        };
                    }
                });
            }

            // 只有当 devtool 面板创建之后才向 content script 发送组件信息。
            if (sanDevtool.devtoolPanelCreated) {
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
        });
    }
}

export default {
    addSanEventListeners,
    addStoreEventListeners
};
