/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Build component tree.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {COMP_ATTACHED, COMP_DETACHED, COMP_UPDATED, INVALID} from './constants';
import CNode from './components';
import {getConfig} from './config';


export default class TreeBuilder {
    constructor({
        root
    } = {}) {
        if (!root || typeof root !== 'object') {
            throw new Error('root is not an object.')
        }
        this._root = root;
    }

    getRoot() {
        return this._root;
    }

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
                    let list = node.ancestorDOMIndexList;
                    let domIndex = i === p.length - 1 ? list[list.length - 1] : list[i];
                    if (domIndex > INVALID) {
                        CNode.insertBeforeInRoot(root, newNode, domIndex);
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

    getIdListByNode(node) {
        if (!node || !Array.isArray(node)) {
            return [];
        }
        return node.filter(x => x.id).map(x => x.id);
    }

    getIndexListByPath(path) {
        if (!path || !Array.isArray(path)) {
            return [];
        }

        let root = this._root;

        return path.map((id, i, p) => {
            let index = this.getIndexByNode(root, id);
            if (index < 0 && i !== p.length - 1) {
                return INVALID;
            }
            if (i < p.length - 1) {
                root = root[index].getSubKey();
            }
            return index;
        }).filter(v => v);
    }

    getIndexByNode(node, id) {
        if (!id || !node || !Array.isArray(node)) {
            return INVALID;
        }
        return node.map((data, index) => data && id === data.id ? index : null)
            .filter(v => v)[0] || INVALID;
    }

    _isValidPath(path) {
        return Array.isArray(path) && !path.some(v => typeof v !== 'string');
    }
}
