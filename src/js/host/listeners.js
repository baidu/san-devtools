/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file San 事件注册。
 */

import constants from '../common/constants';
import utils from '../common/utils';
import components from './components';

// 获得 devtool 显示组件树所需要的组件的信息。
let getComponentTreeItemData = component => ({
    id: component.id,
    text: '<' + getComponentName(component) + '> '
        + getComponentRouteData(component),
    secondaryText: component.id,
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

// 注册所有 San 发送给 devtool 的 event listeners。
// 必须在页面上下文中执行。
// 必须在 window.__san_devtool__ 挂钩注册好后执行。
function addSanEventListeners() {
    if (!utils.isBrowser()) {
        return;
    }
    let global = this;
    if (!global || !global[SAN_DEVTOOL]) {
        return;
    }
    let sanDevtool = global[SAN_DEVTOOL];

    // 8 种事件。
    for (let e of constants.sanEventNames) {
        sanDevtool.on(e, (...args) => {
            // 默认第一个参数均为 Component 实例。
            const component = args[0];

            if (!component || !component.id) {
                return;
            }

            if (e === 'comp-route') {
                let data = buildRoutes(args[0], sanDevtool);
                if (sanDevtool.devtoolPanelCreated) {
                    window.postMessage({...data, message: e}, '*');
                }
                return;
            }

            if (!component.el) {
                return;
            }

            let path = generatePath(component);
            let data = getComponentTreeItemData(component);
            component.idPath = data.idPath = path;

            buildHistory(component, sanDevtool, e);
            components.updatePrimitiveTree(data, e, sanDevtool['data']);
            let indexList = components.getIndexListFromPathAndTreeData(path,
                sanDevtool['data'].treeData);
            let compData = component.data.raw || component.data.data;

            component.el['__san_component__'] = component;
            component.el['__san_path__'] = path;
            component.el['__san_data__'] = compData;
            component.el['__san_tree_index__'] = indexList;

            // 为提高效率在 get 的时候才生成数据。
            if (!component.el.hasOwnProperty('__san_info__')) {
                Object.defineProperty(component.el, '__san_info__', {
                    get() {
                        return {
                            ...components.serialize(component),
                            idPath: path
                        };
                    }
                });
            }

            // 只有当 devtool 面板创建之后才向 content script 发送组件信息。
            if (sanDevtool.devtoolPanelCreated) {
                window.postMessage({
                    message: e,
                    id: component.id,
                    idPath: path,
                    indexList: indexList,
                    data: data,
                    timestamp: Date.now(),
                    componentName: getComponentName(component),
                    compData: JSON.parse(JSON.stringify(compData))
                }, '*');
            }
        });
    }
}

export default {
    addSanEventListeners
};
