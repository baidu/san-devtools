/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file 组件相关的公用工具集，可以运行于页面、content script 或者 devtool 上下文。
 * @author luyuan<luyuan.china@gmail.com>
 */


import {isSanComponent, getXPath} from './utils';
import {__3_INFO__, INVALID, COMP_CONSTRUCTOR_NAME} from './constants';


export function serialize(component, includingParent, keepJSON) {
    if (!component || !isSanComponent(component) || !component.el) {
        return null;
    }
    const id = component.id;
    return {
        id,
        classList: Array.prototype.slice.call(component.el.classList),
        elId: component.el.id,
        tagName: component.tagName,
        xpath: getXPath(component.el),
        subTag: component.subTag,
        idPath: [id],
        // FIXME:
        data: keepJSON
            ? component.data.raw
            : JSON.stringify(component.data.raw),
        parentComponent: includingParent
            ? serialize(component.parentComponent)
            : null,
        parentComponentId: component.parentComponent
            ? [component.parentComponent.id]
            : [],
        ownerComponentId: component.owner ? [component.owner.id] : [],
        parentId: component.parent ? [component.parent.id] : [],
        constructor: component.constructor.name/*,
        // For TreeView
        text: '<' + (component.subTag || component.constructor.name) + '>',
        secondaryText: component.id,
        identity: component.id*/
    };
}


export function getComponentPath(component) {
    let c = component;
    let path = [c.id];
    if (c.parentComponent && c.parentComponent.id) {
        while (c) {
            c = c.parentComponent;
            if (c) {
                path.unshift(c.id);
            }
        }
    }
    return path;
}


export function getComponentName(component) {
    let name = component && (component.subTag || component.constructor.name);
    if (!name || name.length === 1) {
        name = component ? component.tagName : 'Component';
    }
    return name;
}


export function getHistoryInfo(component, message) {
    return {
        id: component.id,
        idPath: component.idPath,
        componentName: getComponentName(component),
        timestamp: Date.now(),
        compData: component.el[__3_INFO__],
        message
    };
}


export function getRouteInfo(component) {
    return {
        id: component.id,
        timestamp: Date.now(),
        routeData: component.data.get('route')
            ? JSON.parse(JSON.stringify(component.data.get('route')))
                : undefined
    };
}


export function getComponentRouteData(component) {
    const data = getRouteInfo(component);
    return data.routeData ? 'Route:' + data.routeData.path : '';
}


export function getComponentRouteExtraData(component) {
    const data = getRouteInfo(component);
    return data.routeData ? {
        icon: 'navigation',
        text: getComponentRouteData(component)
    } : null;
}


/**
 * Get component's DOM index of the parent referring to DOM tree.
 *
 * @param {Object} component Component instance
 * @return {number}
 */
export function getDOMIndexUnderParent(component) {
    if (!component) {
        return INVALID;
    }

    let childrenArray = [];

    const parent = component.parentComponent;
    if (!parent || (!parent.children && !parent.childs)) {
        return INVALID;
    }

    function flattenChildren(children) {
        if (!children || !Array.isArray(children)) {
            return;
        }
        for (let i = 0; i < children.length; i++) {
            if (children[i].constructor.name === COMP_CONSTRUCTOR_NAME) {
                childrenArray.push(children[i]);
            }
            else {
                flattenChildren(children[i].children || children[i].childs);
            }
        }
    }

    flattenChildren(parent.children || parent.childs);
    return childrenArray.indexOf(component);
}


/**
 * Get component's ancestor DOM index list.
 *
 * @param {Object} component Component instance
 * @return {Array}
 */
export function getAncestorDOMIndexList(component) {
    let list = [];
    let comp = component;
    while (comp) {
        let index = getDOMIndexInParent(comp);
        if (index === INVALID) {
            break;
        }
        list.unshift(index);
        comp = comp.parentComponent;
    }
    list.unshift(INVALID);
    return list;
}


export function getComponentTreeItemData(component) {
    const name = getComponentName(component);
    const id = component.id;
    return {
        id,
        text: '<' + name + '>',
        component: {
            name,
            id,
            data: component.data.raw || component.data.data,
            class: component.el.className,
            style: component.el.style.cssText
        },
        secondaryText: id,
        identity: id,
        extras: [getComponentRouteExtraData(component)],
        idPath: component.idPath,
        ancestorDOMIndexList: getAncestorDOMIndexList(component),
        domIndex: getDOMIndexInParent(component),
        parentDOMIndex: getDOMIndexInParent(component.parentComponent)
    };
}
