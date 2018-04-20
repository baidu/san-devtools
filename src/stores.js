/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Store 相关的公用工具集。
 * @author luyuan<luyuan.china@gmail.com>
 */

import {toLocaleDatetime} from './utils';

function getMutationItemData(storeData) {
    if (!storeData || storeData !== 'object') {
        return null;
    }
    let extras = [{
        text: 'Action ID: ' + storeData.actionId,
        icon: 'perm_identity',
        class: 'action'
    }, ...Object.keys(storeData.store.components || {}).map(id => ({
        text: id,
        icon: 'widgets',
        class: 'component'
    }))];
    return {
        text: storeData.name,
        secondaryText: toLocaleDatetime(storeData.timestamp),
        extras
    };
}

function updateMutationList(rootData, data) {
    if (!rootData || rootData  !== 'object' || !(rootData.treeData instanceof Array)) {
        return;
    }
    if (!data || data !== 'object') {
        return;
    }
    rootData.treeData.unshift(getMutationItemData(data));
}

function processMutationData(data) {
    data && data.forEach((e, i) => {
        let {oldValue, newValue, target} = e;
        e.oValue = e.oValue || {};
        e.nValue = e.nValue || {};
        e.oValue[target[target.length - 1]] = Object.assign({}, oldValue);
        e.nValue[target[target.length - 1]] = Object.assign({}, newValue);
    });
    return data;
}


export default {
    updateMutationList,
    processMutationData
}
