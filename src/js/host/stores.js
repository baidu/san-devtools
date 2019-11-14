/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Store 相关的公用工具集。
 * @author luyuan<luyuan.china@gmail.com>
 */

import utils from '../../js/common/utils';

function getMutationItemData(storeData) {
    if (!storeData || typeof storeData !== 'object') {
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
        secondaryText: utils.toLocaleDatetime(storeData.timestamp),
        extras
    };
}

function updateMutationList(rootData, data) {
    if (!rootData || typeof rootData !== 'object' || !Array.isArray(rootData.treeData)) {
        return;
    }
    if (!data || typeof data !== 'object') {
        return;
    }
    rootData.treeData.unshift(getMutationItemData(data));
}

function processMutationData(data) {
    data && data.forEach((e, i) => {
        let {oldValue, newValue, target} = e;
        e.oValue = e.oValue || {};
        e.nValue = e.nValue || {};
        e.oValue[target[target.length - 1]] = {...oldValue};
        e.nValue[target[target.length - 1]] = {...newValue};
    });
    return data;
}


export default {
    updateMutationList,
    processMutationData
}
