/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Build component tree.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {COMP_ATTACHED, COMP_DETACHED, COMP_UPDATED} from './constants';
import {getConfig} from './config';


const INVALID = -1;
const EMPTY_ARRAY = [];


export default class {
    constructor({
        root
    } = {}) {
        if (!root || typeof root !== 'object') {
            throw new Error('root is not an object.')
        }
        this._root = root;
        this.SUB_KEY = getConfig().subKey;
        console.log(this.SUB_KEY)
    }

    getRoot() {
        return this._root;
    }

    emit(event, data) {
        if (!data || typeof data !== 'object' || !data.id) {
            return;
        }

        let root = this._root;
        switch (event) {
            case COMP_ATTACHED:
            case COMP_UPDATED: {
                this.appendOrUpdateNode(data);
                break;
            }
            case COMP_DETACHED: {
                this.removeNode(data);
                break;
            }
        }
    }

    appendOrUpdateNode(data) {
        let path = data.idPath;
        if (!this._isValidPath(path)) {
            return;
        }
        let node = this._root;
        path.forEach((id, i, p) => {
            let index = this.getIdListByNode(node).indexOf(id);
            if (index < 0) {
                let newData = {...data, id};
                if (i !== p.length - 1) {
                    newData[this.SUB_KEY] = [];
                }
                node && node.push(newData);
            }
            else {
                if (node[index] && node[index].id === data.id) {
                    node[index] = {
                        ...node[index],
                        ...data
                    }
                }
            }

            let next = index < 0 ? node[node.length - 1] : node[index];
            if (i < p.length - 1 && !next[this.SUB_KEY]) {
                next[this.SUB_KEY] = [];
            }
            node = next[this.SUB_KEY];
        });
    }

    removeNode(data) {
        let path = data.idPath;
        if (!this._isValidPath(path)) {
            return;
        }
        let node = this._root;
        let prev;
        path.forEach((id, i, p) => {
            let index = this.getIdListByNode(node).indexOf(id);
            if (index < 0) {
                return;
            }
            if (i === p.length - 1) {
                node.splice(index, 1);
                if (node.length === 0 && prev) {
                    delete prev[this.SUB_KEY];
                } 
            }
            if (!node) {
              return;
            }
            if (node[index]) {
                prev = node[index];
                node = node[index][this.SUB_KEY] ? node[index][this.SUB_KEY] : null;
            }
        });
    }

    getIdList(path) {
        if (_isValidPath(path)) {
            this.getNode
        }
        else {
            return this._data.filter(x => x.id).map(x => x.id);
        }
    }

    getIdListByNode(node) {
        if (!node || !Array.isArray(node)) {
            return EMPTY_ARRAY;
        }
        return node.filter(x => x.id).map(x => x.id);
    }

    getIndexListByPath(path) {
        if (!path || !Array.isArray(path)) {
            return EMPTY_ARRAY;
        }
        let node = this._root;
        let a = path.map((id, i, p) => {
            let index = this.getIndexByNode(node, id);
            if (index < 0 && i !== p.length - 1) {
                return;
            }
            if (i < p.length - 1) {
                node = node[index][this.SUB_KEY];
            }
            return index;
        });
        return a.filter(v => v);
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
