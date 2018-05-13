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
        /* eslint-disable fecs-camelcase */
        if (!node || !(CNode.IsCNode(node)) || !node.id) {
            return;
        }
        /* eslint-enable fecs-camelcase */

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
                    /* eslint-disable fecs-camelcase */
                    if (domIndex > INVALID) {
                        CNode.InsertBefore(root, newNode, domIndex);
                    }
                    else {
                        CNode.Append(root, newNode);
                    }
                    /* eslint-enable fecs-camelcase */
                    if (i < p.length - 1) {
                        next = newNode;
                        root = newNode.getSubKey();
                        return;
                    }
                }
            }
            else {
                if (root[index] && root[index].id === node.id) {
                    /* eslint-disable fecs-camelcase */
                    node.setSubKey(root[index].getSubKey());
                    CNode.Update(root, node, index);
                    /* eslint-enable fecs-camelcase */
                }
            }

            if (!next) {
                next = root[index];
            }
            /* eslint-disable fecs-camelcase */
            if (!CNode.IsCNode(next)) {
                return;
            }
            /* eslint-enable fecs-camelcase */

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
                /* eslint-disable fecs-camelcase */
                CNode.RemoveAt(root, index);
                if (root.length === 0 && prev) {
                    prev.deleteSubKey();
                }
                /* eslint-enable fecs-camelcase */
            }

            if (!root) {
              return;
            }

            prev = root[index];
            /* eslint-disable fecs-camelcase */
            if (!CNode.IsCNode(prev)) {
                return;
            }
            /* eslint-enable fecs-camelcase */

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
                return;
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
