/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Build component tree.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {COMP_ATTACHED, COMP_DETACHED, COMP_UPDATED, INVALID} from './constants';
import CNode, {getChildrenComponentList} from './component';
import {getConfig} from './config';

let rootIndex = INVALID;
let newRootIndex = () => rootIndex++;

/* globals Node */

/**
 * A TreeBuilder represents a builder to build whole component tree with CNode.
 *
 * @class
 */
export default class TreeBuilder {
    /**
     * TreeBuilder consturctor
     *
     * @param {Array} root  The root children collection.
     */
    constructor({
        root
    } = {}) {
        if (!root || typeof root !== 'object') {
            throw new Error('root is not an object.')
        }
        this._root = root;
        this._domRoot = document.body;
    }

    /**
     * Retrieve the root.
     *
     * @return {Array}
     */
    getRoot() {
        return this._root;
    }

    /**
     * Determine if has a root CNode.
     *
     * @return {boolean}
     */
    hasRootCNode() {
        return this._root.length > 0;
    }

    /**
     * Emit to append, update or remove a CNode.
     *
     * @param {string} event  The San event.
     * @param {CNode}  node   A CNode instance.
     */
    emit(event, node) {
        if (!node || !(CNode.isCNode(node)) || !node.id) {
            return;
        }

        switch (event) {
            case COMP_ATTACHED:
            case COMP_UPDATED: {
                this.appendNode(node);
                this.attachToDOM(node);
                this.updateRootNodeAncestorIndexList(node);
                break;
            }
            case COMP_DETACHED: {
                this.removeNode(node);
                this.detachFromDOM(node);
                this.updateRootNodeAncestorIndexList(node);
                break;
            }
            default:
                break;
        }
    }

    /**
     * Create a pointer to the root node which is attaching to a DOM element's
     * nearest ancestor component.
     *
     * @param {CNode}  node   A CNode instance to attach.
     */
    attachToDOM(node) {
        if (this.hasRootCNode() && node.isRootNode()) {
            const {foundNode, index} = this.findAttachedComponent(node);
            if (!foundNode) {
                return;
            }
            foundNode.createDOMChildren();
            foundNode.insertDOMChild(node, index);
            node.getDOMParent = () => foundNode;
        }
    }

    /**
     * Remove a pointer to the root node which is detaching from a DOM element's
     * nearest ancestor component.
     *
     * @param {CNode}  node   A CNode instance to detach.
     */
    detachFromDOM(node) {
        if (this.hasRootCNode() && node.isRootNode()) {
            const parent = node.getDOMParent && node.getDOMParent();
            parent && parent.removeDOMChild(parent.getDOMChildren().indexOf(node));
        }
    }

    /**
     * Update root CNode's ancestor index list.
     *
     * @param {CNode} node   A root CNode instance.
     */
    updateRootNodeAncestorIndexList(node) {
        if (node.isRootNode()) {
            node.ancestorIndexList = [newRootIndex()];
            CNode.updateChildren(this.getRoot(), 0, rootIndex);
        }
        else if (node.ancestorIndexList[0] === INVALID) {
            const parent = node.getParent();
            const root = node.getRoot();
            if (node && root && root.ancestorIndexList) {
                const rootIndex = root.ancestorIndexList[0];
                node.ancestorIndexList[0] = rootIndex;
                CNode.updateChildren(node.getSubKey(), 0, rootIndex, false);
            }
        }
    }

    /**
     * Traverse the component according DOM tree to that the specified node
     * attached. Return the object including found node and the index.
     *
     * @param {CNode}  node   A CNode instance.
     * @return {Object}
     */
    findAttachedComponent(node) {
        const component = node.hasComponent() && node._getComponent();
        if (!component || !component.el) {
            return null;
        }
        const el = component.el;

        let found = null;
        let index = -1;

        function traverse(children) {
            if (!Array.isArray(children)) {
                return;
            }

            children.forEach((e, i) => {
                const c = e.hasComponent() && e._getComponent();
                if (!c || !c.el) {
                    return;
                }

                let pos = el.compareDocumentPosition(c.el);
                if (pos & Node.DOCUMENT_POSITION_CONTAINS) {
                    found = e;
                    if (e.getDOMChildren()) {
                        e.getDOMChildren()
                            .map(d => d._getComponent())
                            .map(c => c.el)
                            .forEach((e, i) => {
                                if (!e) {
                                    return;
                                }
                                let pos = el.compareDocumentPosition(e);
                                if (pos & Node.DOCUMENT_POSITION_PRECEDING) {
                                    index = i + 1;
                                } else if (pos & Node.DOCUMENT_POSITION_FOLLOWING) {
                                    index = i;
                                }
                            });
                    }
                    traverse(e.getSubKey());
                }
            });
        }

        traverse(this._root);

        return {foundNode: found, index};
    }

    /**
     * Append a CNode in root refer to ancestor path.
     *
     * @param {CNode} node   A CNode instance.
     */
    appendNode(node) {
        let path = node.ancestorPath;
        if (!this._isValidPath(path)) {
            return;
        }

        let root = this._root;

        path.forEach((id, i, p) => {
            let index = this._getIdListByNode(root).indexOf(id);
            let next;

            if (index < 0) {
                // Create a fake CNode for unattached parent component.
                const {ancestorIndexList, ancestorPath}
                    = this._getCorrectAncestor(node, i);

                let newNode = id === node.id ? node : new CNode(null, {
                    subkey: getConfig().subKey,
                    root: this._root,
                    fake: {...node, id, ancestorIndexList, ancestorPath}
                });

                if (i !== p.length - 1) {
                    newNode.createSubKey();
                }

                if (root) {
                    let list = node.ancestorIndexList;
                    let ancestorIndex = i === p.length - 1
                        ? list[list.length - 1] : list[i];
                    if (ancestorIndex > INVALID) {
                        newNode.insertBefore(root, ancestorIndex);
                        CNode.updateChildren(root, i, ancestorIndex, true);
                    }
                    else {
                        newNode.appendTo(root);
                    }
                    if (i < p.length - 1) {
                        next = newNode;
                        root = newNode.getSubKey();
                        return;
                    }
                }
            }
            else if (root[index] && root[index].id === node.id) {
                node.setSubKey(root[index].getSubKey());
                node.updateAt(root, index);
                CNode.updateChildren(root, i, index, true);
            }

            if (!next) {
                next = root[index];
            }
            if (!CNode.isCNode(next)) {
                return;
            }

            if (i < p.length - 1 && !next.getSubKey()) {
                next.createSubKey();
            }
            root = next.getSubKey();
        });
    }

    /**
     * Remove a CNode from root refer to ancestor path.
     *
     * @param {CNode} node   A CNode instance.
     */
    removeNode(node) {
        let path = node.ancestorPath;
        if (!this._isValidPath(path)) {
            return;
        }

        let root = this._root;
        let prev;

        path.forEach((id, i, p) => {
            let index = this._getIdListByNode(root).indexOf(id);

            if (index < 0) {
                return;
            }

            if (i === p.length - 1) {
                node.removeAt(root, index);
                CNode.updateChildren(root, i, index, true);
                if (root.length === 0 && prev) {
                    prev.deleteSubKey();
                }
            }

            if (!root) {
              return;
            }

            prev = root[index];
            if (!CNode.isCNode(prev)) {
                return;
            }

            root = prev.getSubKey() ? prev.getSubKey() : null;
        });
    }

    /**
     * Retrieve the ID list of the CNode.
     * @inner
     *
     * @param {CNode} node   A CNode instance.
     */
    _getIdListByNode(node) {
        if (!node || !Array.isArray(node)) {
            return [];
        }
        return node.filter(x => x.id).map(x => x.id);
    }

    /**
     * Determine if the ancestor path is valid.
     * @inner
     *
     * @private
     * @param {Array} path   An ancestor path.
     * @return {boolean}
     */
    _isValidPath(path) {
        return Array.isArray(path) && !path.some(v => typeof v !== 'string');
    }

    /**
     * Determine if specifial node is a root CNode instance.
     * @inner
     *
     * @param {CNode} node   A CNode.
     * @return {boolean}
     */
    _isRootNode(node) {
        if (!CNode.isCNode(node)) {
            return false;
        }
        return node._getComponent && node._getComponent() && !node._getComponent().parent;
    }

    /**
     * Recalculate correct ancestor.
     * @inner
     *
     * @param {CNode} node     A CNode.
     * @param {number} index   Node index.
     * @return {Object}
     */
    _getCorrectAncestor(node, index) {
        if (!CNode.isCNode(node)) {
            return false;
        }
        let ancestorIndexList = Object.assign([], node.ancestorIndexList);
        let ancestorPath = Object.assign([], node.ancestorPath);
        ancestorIndexList.splice(index + 1);
        ancestorPath.splice(index + 1);
        return {ancestorIndexList, ancestorPath};
    }
}
