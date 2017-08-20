/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file 组件相关的公用工具集，可以运行于页面、content script 或者 devtool 上下文。
 */

import utils from '../common/utils';
import constants from '../common/constants';

// 得到当前组件树节点的子组件 id 列表。
function getIDListFromTreeData(root) {
    var ids = [];
    if (!root) {
      return ids;
    }
    root.forEach(function (e, i) {
        e.id && ids.push(e.id); 
    });
    return ids;
}

// 得到指定组件 id 在当前组件树节点下的索引值。
function getIndexFromTreeData(id, root) {
    if (!id || !root || !(root instanceof Array)) {
        return -1;
    }
    for (let [index, data] of root.entries()) {
        if (data && id === data.id) {
            return index;
        }
    }
    return -1;
}

// 得到指定组件父子关系路径在当前组件树节点下的索引值列表。
function getIndexListFromPathAndTreeData(path, root) {
    let indexList = [];
    if (!path || !root
        || !(path instanceof Array) || !(root instanceof Array)) {
        return indexList;
    }
    let r = root;
    for (let [i, p] of path.entries()) {
        let index = this.getIndexFromTreeData(p, r);
        if (index < 0 && i !== path.length - 1) {
            continue;
        }
        indexList.push(index);
        if (i < path.length - 1) {
            r = r[index]['treeData']
        }
    }
    return indexList;
}

// 更新和生成基础组件树的具体实现。
function updatePrimitiveTreeDataByPath(root, data, isDeleted) {
    var r = root;
    var owner;
    var path = data.path;
    for (let [i, e] of path.entries()) {
        var index = this.getIDListFromTreeData(r).indexOf(e);
        if (!isDeleted) {
            if (index < 0) {
                r.push(i === path.length - 1 ? {
                    id: e,
                    text: data.text,
                    secondaryText: data.secondaryText
                } : {
                    id: e,
                    text: data.text,
                    secondaryText: data.secondaryText,
                    treeData: []
                });
            } else {
                if (r[index] && r[index].id === data.id) {
                    r[index].text = data.text;
                    r[index].secondaryText = data.secondaryText;
                }
            }
            var r0 = index < 0 ? r[r.length - 1] : r[index];
            if (i < path.length - 1 && !r0.treeData) {
              r0.treeData = [];
            }
            r = r0.treeData;
        } else {
            if (index < 0) {
                return;
            } else {
                if (i === path.length - 1) {
                    r.splice(index, 1);
                    if (r.length === 0 && owner) {
                        delete owner.treeData;
                    } 
                }
                if (!r) {
                  return;
                }
                if (r[index]) {
                    owner = r[index];
                    r = r[index].treeData ? r[index].treeData : null;
                }
            }
        }
    }
    return root;
}

// 序列化必要的组件信息。
function serialize(component, includingParent, keepJSON) {
    if (!component || !utils.isSanComponent(component) || !component.el) {
        return null;
    }
    return {
        id: component.id,
        classList: Array.prototype.slice.call(component.el.classList),
        elId: component.el.id,
        tagName: component.tagName,
        xpath: utils.getXPath(component.el),
        subTag: component.subTag,
        path: [component.id],
        // FIXME:
        data: keepJSON
            ? component.data.raw
            : JSON.stringify(component.data.raw),
        parentComponent: includingParent
            ? serialize(component.parentComponent)
            : undefined,
        // For TreeView
        text: '<' + (component.subTag || component.constructor.name) + '>',
        secondaryText: component.id
    };
}

// 根据 component 实例的 parentComponent 生成组件在 DOM 中的父子关系路径。
function getComponentPath(component) {
    let dataTmp = component;
    let path = [dataTmp.id];
    if (dataTmp.parentComponent && dataTmp.parentComponent.id) {
        while (dataTmp) {
            dataTmp = dataTmp.parentComponent;
            if (dataTmp) {
                path.unshift(dataTmp.id);
            }
        }
    }
    return path;
}

// 更新 window.__san_devtool__.data 上的基础组件树。
function updatePrimitiveTree(data, eventName, root, inBack) {
    if (!data || !data.id || !root) {
        return;
    }

    let global = inBack ? this : window[SAN_DEVTOOL];

    switch (eventName) {
        case 'comp-created': {
            break;
        }

        case 'comp-attached':
        case 'comp-updated': {
            this.updatePrimitiveTreeDataByPath(root['treeData'], data, false);
            break;
        }

        case 'comp-detached': {
            this.updatePrimitiveTreeDataByPath(root['treeData'], data, true);
            break;
        }

        case 'comp-disposed': {
            break;
        }
    }
}

export default {
    updatePrimitiveTree,
    updatePrimitiveTreeDataByPath,
    getComponentPath,
    getIDListFromTreeData,
    getIndexFromTreeData,
    getIndexListFromPathAndTreeData,
    serialize
}
