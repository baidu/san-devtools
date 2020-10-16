import {ComponentTreeData, Component, DevToolsHook} from '../../hook';
import {
    getComponentName,
    getComponentPath,
    getComponentRouteExtraData
} from '../../utils/sanHelper';

/**
 * 得到当前treeData数组所有节点的 id 列表
 * @param {ComponentTreeData[]} treeData
 */
function getIDListFromTreeData(treeData: ComponentTreeData[]) {
    let ids: string[] = [];
    if (!treeData) {
        return ids;
    }
    treeData.forEach((data: any) => {
        data.id && ids.push(data.id);
    });
    return ids;
}

export function addToTreeData(rootTreeData: ComponentTreeData[], data: ComponentTreeData) {
    let nodeTreeData = rootTreeData;
    let path = data.idPath;
    let pathLen = path.length;
    for (let [count, curId] of path.entries()) {
        let index = getIDListFromTreeData(nodeTreeData).indexOf(curId);
        if (index < 0) {
            // 如果当前节点没有则直接插入 treeData
            if (count === pathLen - 1) {
                nodeTreeData.push(data);
                return;
            }
            // 如果祖先节点没有则需要创建一个空的父节点，下一次遍历对象是这个空的父节点的 treeData
            let fakeParentData = {
                id: curId,
                parentId: null,
                displayName: '',
                extras: [],
                idPath: [],
                ownerId: '',
                tagName: '',
                treeData: []
            };
            nodeTreeData.push(fakeParentData);
            nodeTreeData = fakeParentData.treeData;
        } else {
            // 如果 attached 的当前节点是某个父节点，那么不管是不是空节点，都需要填充一下
            if (nodeTreeData[index] && nodeTreeData[index].id === data.id) {
                nodeTreeData[index].parentId = data.parentId;
                nodeTreeData[index].ownerId = data.ownerId;
                nodeTreeData[index].tagName = data.tagName;
                nodeTreeData[index].displayName = data.displayName;
                nodeTreeData[index].idPath = data.idPath;
                nodeTreeData[index].extras = data.extras;
            }
            nodeTreeData = nodeTreeData[index].treeData;
        }
    }
}

export function deleteFromTreeData(rootTreeData: ComponentTreeData[], data: ComponentTreeData) {
    let nodeTreeData = rootTreeData;
    let path = data.idPath;
    let pathLen = path.length;
    for (let [count, curId] of path.entries()) {
        if (!nodeTreeData || nodeTreeData.length === 0) {
            return;
        }
        let index = getIDListFromTreeData(nodeTreeData).indexOf(curId);
        if (index < 0) {
            return;
        }
        if (count === pathLen - 1) {
            nodeTreeData.splice(index, 1);
        }
        if (nodeTreeData[index]) {
            nodeTreeData = nodeTreeData[index].treeData ? nodeTreeData[index].treeData : [];
        }
    }
}

export function getComponentTree(hook: DevToolsHook<{}>, component: Component) {
    let {id} = component;
    let treeData: ComponentTreeData = {
        id: component.id,
        parentId: component.parentComponent ? component.parentComponent.id : '',
        ownerId: component.owner ? component.owner.id : '',
        tagName: component.tagName || '',
        displayName: getComponentName(component),
        extras: getComponentRouteExtraData(component),
        idPath: getComponentPath(component),
        treeData: []
    };
    if (!hook.storeComponentMap.has(id + '')) {
        return treeData;
    } else {
        let {
            mapStates,
            mapActionsKeys,
            storeName,
            extra
        } = hook.storeComponentMap.get(id + '');
        treeData.extras.push(extra);
        treeData.mapStates = mapStates;
        treeData.mapActionsKeys = mapActionsKeys;
        treeData.storeName = storeName;
        return treeData;
    }
}