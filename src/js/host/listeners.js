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
function getComponentTreeItemData(component) {
    let id = component.id;
    let componentName = component.subTag || component.constructor.name;
    return {
        id: id,
        text: '<' + componentName + '>',
        secondaryText: id,
        idPath: component.idPath
    };
}

// 生成组件的路径。
function generatePath(component) {
    component.idPath = components.getComponentPath(component);
    return component.idPath;
}

// 将所有事件信息存入 history 数组，以便后续使用。
function buildHistory(component, root, event) {
    if (!root || !root['history']) {
        return;
    }
    sanDevtool['history'].push({
        id: component.id,
        path: component.path,
        timestamp: Date.now(),
        data: component.data.raw,
        message: event
    });
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

    // 7 种事件。
    for (let e of constants.sanEventNames) {
        sanDevtool.on(e, (...args) => {
            // 默认第一个参数均为 Component 实例。
            const component = args[0];
            if (!component) {
                return;
            }
            let el = component.el;
            if (!el) {
                return;
            }
            if (!el.id) {
                return;
            }

            let path = generatePath(component);
            let data = getComponentTreeItemData(component);
            buildHistory(component);
            components.updatePrimitiveTree(data, e, sanDevtool['data']);
            let indexList = components.getIndexListFromPathAndTreeData(path,
                sanDevtool['data'].treeData);

            el['__san_component__'] = component;
            el['__san_path__'] = path;
            el['__san_data__'] = component.data.raw;
            el['__san_tree_index__'] = indexList;

            // 为提高效率在 get 的时候才生成数据。
            if (!el.hasOwnProperty('__san_info__')) {
                Object.defineProperty(el, '__san_info__', {
                    get() {
                        let info = components.serialize(component);
                        info.idPath = path;
                        return info;
                    }
                });
            }

            // 只有当 devtool 面板创建之后才向 content script 发送组件信息。
            if (sanDevtool.devtoolPanelCreated) {
                window.postMessage({
                    message: e,
                    id: component.id,
                    idPath: path,
                    //ancestors: ancestors,
                    indexList: indexList,
                    data: data
                }, '*');
            }
        });
    }
}

export default {
    addSanEventListeners
};
