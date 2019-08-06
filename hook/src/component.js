/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Component common functions and CNode.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {isSanComponent} from './utils';
import {__3_CNODE__, INVALID, SUB_KEY, DOM_CHILDREN_KEY} from './constants';
import {getConfig} from './config';

/* globals Node */


/**
 * Get component's index of the parent component referring to DOM tree.
 *
 * @param {Object} component Component instance
 * @return {number}
 */
export function getIndexInParent(component) {
    if (!component) {
        return INVALID;
    }

    const childrenList = getChildrenComponentList(component.parentComponent);
    if (childrenList.length <= 0) {
        return INVALID;
    }

    return childrenList.indexOf(component);
}


/**
 * Get children component instances of specified component referring to DOM tree.
 *
 * @param {Object} component Component instance
 * @return {Array}
 */
export function getChildrenComponentList(component) {
    let childrenList = [];
    if (!component || (!component.children && !component.childs)) {
        return childrenList;
    }

    function flattenChildren(children) {
        if (!children || !Array.isArray(children)) {
            return;
        }
        for (let i = 0; i < children.length; i++) {
            if (isSanComponent(children[i])) {
                childrenList.push(children[i]);
            }
            else if (children[i]) {
                flattenChildren(children[i].children || children[i].childs);
            }
        }
    }

    flattenChildren(component.children || component.childs);
    return childrenList;
}


/**
 * Get the index of specified DOM element in its siblings.
 *
 * @param {Object} el       DOM element to compare.
 * @param {Array} siblings  Other sibling elements.
 * @return {number}
 */
export function getSiblingComparePosition(el, siblings) {
    if (!el || !Array.isArray(siblings)) {
        return INVALID;
    }
    let index = 0;
    siblings.forEach(item => {
        let pos = el.compareDocumentPosition(item);
        if (pos & Node.DOCUMENT_POSITION_CONTAINS
            || pos & Node.DOCUMENT_POSITION_CONTAINED_BY) {
            return;
        }
        if (pos & Node.DOCUMENT_POSITION_PRECEDING) {
            index++;
        }
    });
    return Math.min(index, siblings.length);
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
    constructor(component, {
        subKey = SUB_KEY,
        domChildrenKey = DOM_CHILDREN_KEY,
        message,
        fake,
        root
    } = {}) {
        this._subKey = subKey;
        this._domChildrenKey = domChildrenKey;
        this._lastMessage = message;

        // Save root
        this._rootCollection = () => root;

        if (!isSanComponent(component)) {
            this.init(fake);
            return;
        }
        if (!component.id) {
            return;
        }

        // Save component
        this._getComponent = () => component;
        this._getParentComponent = () => component.parentComponent;
        this._getChildrenComponent = () => getChildrenComponentList(component);

        component[__3_CNODE__] = this;

        this.init();
    }

    /**
     * Initialize a CNode.
     *
     * @param {Object?} fake  Initial with fake parameters if component is null.
     */
    init(fake = null) {
        if (fake && typeof fake === 'object') {
            for (let k in fake) {
                if (typeof fake[k] !== 'function') {
                    this[k] = fake[k];
                }
            }
            this.fake = true;
        }
        else {
            const comp = this._getComponent();
            this.id = comp.id;
            this.template = comp.template;
            this.parentTemplate = comp.parentComponent
                ? comp.parentComponent.template
                : null;

            this.name = this._getName();
            this.data = this._getData();
            this.history = this._getHistoryInfo();
            this.route = this._getRouteInfo();
            this.callbacks = this._getCallbackInfo();
            this.props = [];
            this.parentId = this.hasParentComponent()
                ? this._getParentComponent().id
                : null;
            this.fake = false;
        }
    }

    /**
     * Get the root CNode of current.
     *
     * @return {CNode}
     */
    getRoot() {
        return this.hasParentComponent()
            ? getAncestorComponent(this._getComponent())[0][__3_CNODE__] : null;
    }

    /**
     * Get the parent CNode of current.
     *
     * @return {CNode}
     */
    getParent() {
        return this.hasParentComponent()
            ? this._getParentComponent()[__3_CNODE__] : null;
    }

    /**
     * Get previous sibling CNode.
     *
     * @return {Array}
     */
    getPrevious() {
        return this.getPreviousSiblingComponent()
            ? this.getPreviousSiblingComponent()[__3_CNODE__] : null;
    }

    /**
     * Get next sibling CNode.
     *
     * @return {Array}
     */
    getNext() {
        return this.getNextSiblingComponent()
            ? this.getNextSiblingComponent()[__3_CNODE__] : null;
    }

    /**
     * Determine if current CNode has a binding component instance.
     *
     * @return {boolean}
     */
    hasComponent() {
        return typeof this._getComponent === 'function'
            && !!this._getComponent();
    }

    /**
     * Determine if current CNode's binding component has a parent component.
     *
     * @return {boolean}
     */
    hasParentComponent() {
        return this.hasComponent() && !!this._getParentComponent();
    }

    /**
     * Get the previous sibing component instance in parent.
     *
     * @return {CNode}
     */
    getPreviousSiblingComponent() {
        if (!this.hasParentComponent() || !this.ancestorIndexList) {
            return null;
        }
        const index = this.ancestorIndexList[this.ancestorIndexList.length - 1];
        const list = getChildrenComponentList(this._getParentComponent());
        return index > 0 ? list[index - 1] : null;
    }

    /**
     * Get the next sibing component instance in parent.
     *
     * @return {CNode}
     */
    getNextSiblingComponent() {
        if (!this.hasParentComponent() || !this.ancestorIndexList) {
            return null;
        }
        const index = this.ancestorIndexList[this.ancestorIndexList.length - 1];
        const list = getChildrenComponentList(this._getParentComponent());
        return index < list.length - 1 ? list[index + 1] : null;
    }

    /**
     * Return a serialized CNode.
     *
     * @return {CNode?}
     */
    serialize() {
        let serialized = Object.assign({}, this);
        serialized.getParent = this.getParent.bind(this);
        serialized.getPrevious = this.getPrevious.bind(this);
        serialized.getNext = this.getNext.bind(this);

        return serialized;
    }

    /**
     * Simplify properties.
     */
    simplify() {
        if (getConfig().simplifiedCNode) {
            Object.keys(this).forEach(k => {
                if (k.startsWith('_') && typeof this[k] !== 'function') {
                    delete this[k];
                }
                delete this.fake;
                delete this.history;
                delete this.route;
                delete this.template;
                delete this.parentTemplate;
            });
        }
    }

    /**
     * Generate ancestor's information.
     */
    seekAncestor() {
        const {path, indexList} = this._getAncestorInfo();
        this.ancestorPath = path;
        this.ancestorIndexList = indexList;
    }

    /**
     * Append a child CNode instance.
     *
     * @param {CNode} node  The CNode instance to be appended.
     */
    appendChild(node) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            this.getSubKey().push(node);
        }
    }

    /**
     * Append current CNode instance to specified root.
     *
     * @static
     * @param {Array} root   The root collection.
     * @param {CNode} node   A CNode to be appended.
     */
    appendTo(root) {
        if (Array.isArray(root)) {
            root.push(this);
        }
    }

    /**
     * Update a child CNode instance at specified index.
     *
     * @param {CNode} node   The CNode instance to be updated.
     * @param {index} index  The index of the CNode to be updated.
     */
    updateChild(node, index) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            this.getSubKey()[index] = node;
        }
    }

    /**
     * Update current CNode instance at specified index in specified root.
     *
     * @static
     * @param {Array} root   The root collection.
     * @param {number} index The index of the CNode to be updated.
     */
    updateAt(root, index) {
        if (Array.isArray(root)) {
            root[index] = this;
        }
    }

    /**
     * Insert a child CNode instance before specified index.
     *
     * @param {CNode} node    The CNode instance to be inserted.
     * @param {before} index  The index of the CNode to be inserted.
     */
    insertChild(node, before) {
        if (CNode.isCNode(node)) {
            this.createSubKey();
            this.getSubKey().splice(before, 0, node);
            this._getAncestorIndexList();
        }
    }

    /**
     * Insert current CNode instance before specified index in specified root.
     *
     * @static
     * @param {Array} root     The root collection.
     * @param {number} before  The index of the CNode to be inserted.
     */
    insertBefore(root, before) {
        if (Array.isArray(root)) {
            root.splice(before, 0, this);
        }
    }

    /**
     * Remove a child CNode instance at specified index.
     *
     * @param {number} at    The index of the CNode to be removed.
     */
    removeChild(at) {
        this.getSubKey().splice(at, 1);
        this._getAncestorIndexList();
    }

    /**
     * Remove current CNode instance at specified index in specified root.
     *
     * @static
     * @param {Array} root    The root collection.
     * @param {number} at.    The index of the CNode to be removed.
     */
    removeAt(root, at) {
        if (Array.isArray(root)) {
            root.splice(at, 1);
        }
    }

    /**
     * Get children CNode collection.
     *
     * @return {Array}
     */
    getSubKey() {
        return this[this._subKey || getConfig().subKey];
    }

    /**
     * Replace the children collection with specified.
     *
     * @param {Array} children   The specified children collection.
     */
    setSubKey(children) {
        if (Array.isArray(children)) {
            this[this._subKey || getConfig().subKey] = children;
        }
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
        if (Array.isArray(this.getSubKey()) && this.getSubKey().length === 0) {
            delete this[this._subKey || getConfig().subKey];
        }
    }

    /**
     * Get the root nodes attaching to current node in DOM.
     *
     * @return {Array}
     */
    getDOMChildren() {
        return this[this._domChildrenKey || getConfig().domChildrenKey];
    }

    /**
     * Replace the root nodes attaching to current node in DOM with specified.
     *
     * @param {Array} children   The specified children collection.
     */
    setDOMChildren(children) {
        if (Array.isArray(children)) {
            this[this._domChildrenKey || getConfig().domChildrenKey] = children;
        }
    }

    /**
     * Create an empty DOM children collection if do not exist.
     */
    createDOMChildren() {
        if (!Array.isArray(this.getDOMChildren())) {
            this.setDOMChildren([]);
        }
    }

    /**
     * Delete the DOM children collection if empty.
     *
     * @param {boolean} force   Delete if not empty.
     */
    deleteDOMChildren(force = false) {
        if (Array.isArray(this.getDOMChildren())) {
            if (force || this.getDOMChildren().length === 0) {
                delete this[this._domChildrenKey || getConfig().domChildrenKey];
            }
        }
    }

    /**
     * Insert a root node attaching to current node to DOM children collection.
     *
     * @param {CNode}   node     The root node to attach.
     * @param {number?} before   The index to insert.
     */
    insertDOMChild(node, before = -1) {
        if (CNode.isCNode(node)) {
            this.createDOMChildren();
            before === -1
                ? this.getDOMChildren().push(node)
                : this.getDOMChildren().splice(before, 0, node);
            this._getAncestorIndexList();
        }
    }

    /**
     * Remove the specified root node deteching from current node.
     *
     * @param {number} at   The index to insert.
     */
    removeDOMChild(at) {
        this.getDOMChildren().splice(at, 1);
    }

    /**
     * Merge current CNode instance with the given object.
     *
     * @param {Object} object   The object need to be merged.
     */
    merge(object) {
        try {
            if (object && typeof object === 'object') {
                Object.keys(object).forEach(k => {
                    this[k] = object[k];
                });
                Object.keys(this).forEach(k => {
                    if (!object[k]) {
                        delete this[k];
                    }
                });
            }
        } catch (ex) {
            return null;
        }
        return this;
    }

    /**
     * Parse ANode of component for more details.
     */
    parseANode() {
        if (!this._getComponent()) {
            return;
        }
        const binds = this._getComponent().binds;
        if (!binds) {
            return;
        }
        const props = binds.raw || binds;
        props.forEach(e => {
            this.props.push({key: e.name, value: e.raw});
        });
    }

    /**
     * Determine if specifial node is a root CNode instance.
     * @inner
     *
     * @param {CNode} node   A CNode.
     * @return {boolean}
     */
    isRootNode() {
        return !!(this._getComponent && this._getComponent()
            && !this._getComponent().parentComponent);
    }

    /**
     * Retrieve component's subTag or constructor name as CNode's name.
     *
     * @private
     * @return {string}
     */
    _getName() {
        if (!this._getComponent()) {
            return null;
        }
        return this._getComponent().subTag
            || this._getComponent().constructor.name;
    }

    /**
     * Retrieve component's data as CNode's data.
     *
     * @private
     * @return {Object}
     */
    _getData() {
        if (!this._getComponent()) {
            return null;
        }
        return this._getComponent().data && (this._getComponent().data.raw
            || this._getComponent().data.data);
    }

    /**
     * Retrieve component's ancestor ID path.
     *
     * @private
     * @return {Array}
     */
    _getAncestorPath() {
        return getAncestorComponent(this._getComponent()).map(v => v.id + '');
    }

    /**
     * Retrieve component's ancestor index list.
     *
     * @private
     * @return {Array}
     */
    _getAncestorIndexList() {
        return getAncestorComponent(this._getComponent())
            .map(v => getIndexInParent(v));
    }

    /**
     * Retrieve component's ancestor info including path and index list.
     *
     * @private
     * @return {Object}
     */
    _getAncestorInfo() {
        const info = getAncestorComponent(this._getComponent()).map(v => ({
            path: v.id + '',
            indexList: getIndexInParent(v)
        }));
        return {
            path: info.map(i => i.path),
            indexList: info.map(i => i.indexList)
        };
    }

    /**
     * Retrieve component's lastest history info.
     *
     * @private
     * @return {Object}
     */
    _getHistoryInfo() {
        if (this.fake || !this.hasComponent()) {
            return null;
        }
        return {
            id: this.id,
            ancestorPath: this._getAncestorPath(),
            message: this._lastMessage,
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
        if (this.fake  || !this.hasComponent() ||  !this.data || !this.data['route']) {
            return null;
        }
        return {
            id: this.id,
            timestamp: Date.now(),
            routeData: this.data['route']
        };
    }

    /**
     * Retrieve component's computed, computedDeps, filters, listeners and
     * messages callback instances.
     *
     * @private
     * @return {Object}
     */
    _getCallbackInfo() {
        if (this.fake || !this.hasComponent()) {
            return null;
        }
        const {computed, computedDeps, filters, listeners, messages} = this._getComponent();
        return {computed, computedDeps, filters, listeners, messages};
    }

    /**
     * Determine if this is a CNode instance.
     *
     * @static
     * @return {boolean}
     */
    static isCNode = node => (node instanceof CNode);

    /**
     * Update descendant's ancestorIndexList when siblings inserted or removed.
     *
     * @param {Array} children   Children CNode array.
     * @param {number} level     Path level.
     * @param {number} newIndex  New index need to be updated.
     * @param {boolean?} isRoot  Determine if this is root CNode for updating.
     */
    static updateChildren = (children, level, newIndex, isRoot = true) => {
        if (Array.isArray(children)) {
            children.forEach((e, i) => {
                let value = isRoot ? i : newIndex;
                e.ancestorIndexList[level] = value;
                CNode.updateChildren(e.getSubKey(), level, value, false);
            });
        }
    };

}
