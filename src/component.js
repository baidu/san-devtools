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
 * Get component's index of the parent referring to DOM tree.
 *
 * @param {Object} component Component instance
 * @return {number}
 */
export function getIndexInParent(component) {
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
 * Get component's ancestor component list.
 *
 * @param {Object} component Component instance
 * @return {Array}
 */
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


/**
 * A CNode represents a serializable object of the specified component instance.
 *
 * @class
 */
export default class CNode {
    /**
     * CNode consturctor
     *
     * @param {Object} component Component instance
     * @param {Object?} options
     * @param {Object?} options.subKey Key for children
     * @param {Object?} options.fake   Initial with fake parameters
     */
    constructor(component, {subKey = SUB_KEY, fake} = {}) {
        this._subKey = subKey;
        if (!isSanComponent(component)) {
            this.init(fake);
            return;
        }
        if (!component.id) {
            return;
        }
        this.attach(component);
        this.init();
    }

    /**
     * Initialize a CNode.
     *
     * @param {Object?} fake   Initial with fake parameters
     */
    init(fake = null) {
        if (fake && typeof fake === 'object') {
            for (let k in fake) {
                if (typeof fake[k] !== 'function') {
                    this[k] = fake[k];
                }
            }
            return;
        }
        this.id = this._component.id;
        this.template = this._component.template;
        this.parentTemplate = this._component.parentComponent
            ? this._component.parentComponent.template
            : null;

        this.name = this._getName();
        this.data = this._getData();
        this.history = this._getHistoryInfo();
        this.route = this._getRouteInfo();
        this.props = [];
    }

    /**
     * Attach to a San component.
     *
     * @param {Component} component  A San component instance
     */
    attach(component) {
        this._component = component;
    }

    /**
     * Detach from the San component.
     */
    detach() {
        delete this._component;
    }

    /**
     * Detach from the San component.
     *
     * @param {boolean?} autoDeteched  Determine if detaching automatically.
     */
    seekAncestor(autoDeteched = true) {
        this.ancestorPath = this._getAncestorPath();
        this.ancestorIndexList = this._getAncestorIndexList();
        // Detech _component to avoid circular structure.
        autoDeteched && this.detach();
    }

    /**
     * Append a child CNode instance.
     *
     * @param {CNode} node  The CNode instance to be appended.
     */
    append(node) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            CNode.appendInRoot(this.getSubKey(), node);
        }
    }

    /**
     * Update a child CNode instance at specified index.
     *
     * @param {CNode} node   The CNode instance to be updated.
     * @param {index} index  The index of the CNode to be updated.
     */
    update(node, index) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            CNode.updateInRoot(this.getSubKey(), node, index);
        }
    }

    /**
     * Insert a child CNode instance before specified index.
     *
     * @param {CNode} node    The CNode instance to be inserted.
     * @param {before} index  The index of the CNode to be inserted.
     */
    insertBefore(node, before) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            CNode.insertBeforeInRoot(this.getSubKey(), node, before);
        }
    }

    /**
     * Remove a child CNode instance at specified index.
     *
     * @param {number} at    The index of the CNode to be removed.
     */
    removeAt(at) {
        CNode.removeAtInRoot(this.getSubKey(), at);
    }

    /**
     * Create an empty children collection if do not exist.
     */
    createSubKey() {
        if (!Array.isArray(this.getSubKey())) {
            this.setSubKey([]);
        }
    }

    /**
     * Delete the children collection if empty.
     */
    deleteSubKey() {
        if (Array.isArray(this.getSubKey()) && this.getSubKey().length > 0) {
            delete this[this._subKey];
        }
    }

    /**
     * Merge current CNode instance with the given object.
     *
     * @param {Object} object   The object need to be merged.
     */
    merge(object) {
        if (typeof object === 'object') {
            return Object.keys(object).forEach(k => (this[k] = object[k]));
        }
    }

    /**
     * Parse ANode of component for more details.
     */
    parseANode() {
        if (!this._component) {
            return;
        }
        const binds = this._component.binds;
        if (!binds) {
            return;
        }
        const props = binds.raw || binds;
        props.forEach(e => {
            this.props.push({key: e.name, value: e.raw});
        });
    }

    /**
     * Retrieve children CNode collection.
     *
     * @return {Array}
     */
    getSubKey() {
        return this[this._subKey];
    }

    /**
     * Replace the children collection with specified.
     *
     * @param {Array} children   The specified children collection.
     */
    setSubKey(children) {
        if (Array.isArray(children)) {
            this[this._subKey] = children;
        }
    }

    /**
     * Retrieve component's subTag or constructor name as CNode's name.
     *
     * @private
     * @return {string}
     */
    _getName() {
        if (!this._component) {
            return null;
        }
        return this._component.subTag || this._component.constructor.name;
    }

    /**
     * Retrieve component's data as CNode's data.
     *
     * @private
     * @return {Object}
     */
    _getData() {
        if (!this._component) {
            return null;
        }
        return this._component.data
            && (this._component.data.raw || this._component.data.data);
    }

    /**
     * Retrieve component's ancestor ID path.
     *
     * @private
     * @return {Array}
     */
    _getAncestorPath() {
        if (!this._component) {
            return null;
        }
        return getAncestorComponent(this._component).map(v => v.id);
    }

    /**
     * Retrieve component's ancestor index list.
     *
     * @private
     * @return {Array}
     */
    _getAncestorIndexList() {
        if (!this._component) {
            return null;
        }
        return getAncestorComponent(this._component)
            .map(v => getIndexInParent(v));
    }

    /**
     * Retrieve component's lastest history info.
     *
     * @private
     * @return {Object}
     */
    _getHistoryInfo() {
        return {
            id: this.id,
            ancestorPath: this._getAncestorPath(),
            name: this.name,
            timestamp: Date.now(),
            data: this.data
        };
    }

    /**
     * Retrieve component's route info if has.
     *
     * @private
     * @return {Object}
     */
    _getRouteInfo() {
        return {
            id: this.id,
            timestamp: Date.now(),
            routeData: this.data && this.data['route']
        };
    }

    /**
     * Determine if this is a CNode instance.
     *
     * @static
     * @return {boolean}
     */
    static isCNode = node => (node instanceof CNode);

    /**
     * Append a child CNode instance in specified root.
     *
     * @static
     * @param {Array} root   The root collection.
     * @param {CNode} node   A CNode to be appended.
     */
    static appendInRoot = (root, node) => {
        if (Array.isArray(root)) {
            root.push(node);
        }
    }

    /**
     * Update a child CNode instance at specified index in specified root.
     *
     * @static
     * @param {Array} root   The root collection.
     * @param {CNode} node   A CNode to be updated.
     * @param {number} index The index of the CNode to be updated.
     */
    static updateInRoot = (root, node, index) => {
        if (Array.isArray(root)) {
            root[index] = node;
        }
    }

    /**
     * Insert a child CNode instance before specified index in specified root.
     *
     * @static
     * @param {Array} root     The root collection.
     * @param {CNode} node     A CNode to be inserted.
     * @param {number} before  The index of the CNode to be inserted.
     */
    static insertBeforeInRoot = (root, node, before) => {
        if (Array.isArray(root)) {
            root.splice(before, 0, node);
        }
    }

    /**
     * Remove a child CNode instance at specified index in specified root.
     *
     * @static
     * @param {Array} root    The root collection.
     * @param {number} at.    The index of the CNode to be removed.
     */
    static removeAtInRoot = (root, at) => {
        if (Array.isArray(root)) {
            root.splice(at, 1);
        }
    }
}
