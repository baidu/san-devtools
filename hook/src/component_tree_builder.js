/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Build component tree.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {COMP_ATTACHED, COMP_DETACHED, COMP_UPDATED, INVALID} from './constants';
import CNode from './component';
import {getConfig} from './config';


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
                break;
            }
            case COMP_DETACHED: {
                this.removeNode(node);
                break;
            }
            default:
                break;
        }
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
            let index = this.getIdListByNode(root).indexOf(id);
            let next;

            if (index < 0) {
                // Create a fake CNode for unattached parent component.
                let newNode = new CNode(null, {
                    subkey: getConfig().subKey,
                    fake: {...node, id}
                });

                if (i !== p.length - 1) {
                    newNode.createSubKey();
                }

                if (root) {
                    let list = node.ancestorIndexList;
                    let ancestorIndex = i === p.length - 1
                        ? list[list.length - 1] : list[i];
                    if (ancestorIndex > INVALID) {
                        CNode.insertBeforeInRoot(root, newNode, ancestorIndex);
                    }
                    else {
                        CNode.appendInRoot(root, newNode);
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
                CNode.updateInRoot(root, node, index);
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
            let index = this.getIdListByNode(root).indexOf(id);

            if (index < 0) {
                return;
            }

            if (i === p.length - 1) {
                CNode.removeAtInRoot(root, index);
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
     *
     * @param {CNode} node   A CNode instance.
     */
    getIdListByNode(node) {
        if (!node || !Array.isArray(node)) {
            return [];
        }
        return node.filter(x => x.id).map(x => x.id);
    }

    /**
     * Determine if the ancestor path is valid.
     *
     * @private
     * @param {Array} path   An ancestor path.
     * @return {boolean}
     */
    _isValidPath(path) {
        return Array.isArray(path) && !path.some(v => typeof v !== 'string');
    }
}
