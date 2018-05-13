/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Component common functions and CNode.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {isSanComponent} from './utils';
import {__3_INFO__, INVALID, COMP_CONSTRUCTOR_NAME, SUB_KEY} from './constants';


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


export function getAncestorComponent(component) {
    let c = component;
    let ancestor = [c];
    while (c) {
        c = c.parentComponent;
        if (c) {
            ancestor.unshift(c);
        }
    }
    return ancestor;
}


export default class CNode {
    constructor(component, {subKey = SUB_KEY, fake = {}} = {}) {
        this._subKey = subKey;
        if (!isSanComponent(component)) {
            this.init(fake);
            return;
        }
        if (!component.id) {
            console.warn('Component is not initialized.');
            return;
        }
        this._component = component;
        this.init();
        // Detech _component to avoid circular structure.
        delete this._component;
    }

    init = fake => {
        if (typeof fake === 'object') {
            for (let k in fake) {
                if (typeof fake[k] !== 'function') {
                    this[k] = fake[k];
                }
            }
            return;
        }
        this.id = this._component.id;
        this.template = this._component.template;
        this.name = this._getName();
        this.data = this._getData();
        this.ancestorPath = this._getAncestorPath();
        this.ancestorDOMIndexList = this._getAncestorDOMIndexList();
        this.history = this._getHistoryInfo();
        this.route = this._getRouteInfo();
    }

    append = node => {
        /* eslint-disable fecs-camelcase */
        if (CNode.IsCNode(node)) {
            this.createSubKey();
            CNode.Append(this.getSubKey(), node);
        }
        /* eslint-enable fecs-camelcase */
    }

    update = (node, index) => {
        /* eslint-disable fecs-camelcase */
        if (CNode.IsCNode(node)) {
            this.createSubKey();
            CNode.Update(this.getSubKey(), node, index);
        }
        /* eslint-enable fecs-camelcase */
    }

    insertBefore = (node, before) => {
        /* eslint-disable fecs-camelcase */
        if (CNode.IsCNode(node)) {
            this.createSubKey();
            CNode.InsertBefore(this.getSubKey(), node, before);
        }
        /* eslint-enable fecs-camelcase */
    }

    removeAt = at => {
        /* eslint-disable fecs-camelcase */
        CNode.RemoveAt(this.getSubKey(), at);
        /* eslint-enable fecs-camelcase */
    }

    createSubKey = () => {
        if (!Array.isArray(this.getSubKey())) {
            this.setSubKey([]);
        }
    };

    deleteSubKey = () => {
        if (Array.isArray(this.getSubKey()) && this.getSubKey().length > 0) {
            delete this[this._subKey];
        }
    }

    merge = object => {
        if (object) {
            return Object.keys(object).forEach(k => (this[k] = object[k]));
        }
    }

    getSubKey = () => this[this._subKey];

    setSubKey = children => (this[this._subKey] = children);

    _getName = () => (this._component.subTag || this._component.constructor.name);

    _getData = () => (this._component.data
        && (this._component.data.raw || this._component.data.data));

    _getAncestorPath = () => getAncestorComponent(this._component).map(v => v.id);

    /**
     * Get current component's ancestor DOM index list.
     *
     * @return {Array}
     */
    _getAncestorDOMIndexList = () => getAncestorComponent(this._component)
        .map(v => getDOMIndexUnderParent(v));

    _getHistoryInfo = () => ({
        id: this.id,
        ancestorPath: this.ancestorPath,
        name: this.name,
        timestamp: Date.now(),
        data: this.data
    });

    _getRouteInfo = () => ({
        id: this.id,
        timestamp: Date.now(),
        routeData: this.data && this.data['route']
    });

    static IsCNode = node => (node instanceof CNode);

    static Append = (root, node) => {
        if (Array.isArray(root)) {
            root.push(node);
        }
    }

    static Update = (root, node, index) => {
        if (Array.isArray(root)) {
            root[index] = node;
        }
    }

    static InsertBefore = (root, node, before) => {
        if (Array.isArray(root)) {
            root.splice(before, 0, node);
        }
    }

    static RemoveAt = (root, at) => {
        if (Array.isArray(root)) {
            root.splice(at, 1);
        }
    }
}
