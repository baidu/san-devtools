/**
 * @file
 */
import {builder} from 'san-update';
import {ComponentTreeData} from 'backend/src/hook';
interface ComponentTreeInfo{
    type: 'add' | 'del';
    data: ComponentTreeData;
}

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
                return true;
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
                nodeTreeData[index].mapStates = data.mapStates;
                nodeTreeData[index].mapActionsKeys = data.mapActionsKeys;
                nodeTreeData[index].storeName = data.storeName;
                return true;
            }
            nodeTreeData = nodeTreeData[index].treeData;
        }
    }
    return false;
}

export function deleteFromTreeData(rootTreeData: ComponentTreeData[], data: ComponentTreeData) {
    let nodeTreeData = rootTreeData;
    let path = data.idPath;
    let pathLen = path.length;
    for (let [count, curId] of path.entries()) {
        if (!nodeTreeData || nodeTreeData.length === 0) {
            return false;
        }
        let index = getIDListFromTreeData(nodeTreeData).indexOf(curId);
        if (index < 0) {
            return false;
        }
        if (count === pathLen - 1) {
            nodeTreeData.splice(index, 1);
            return true;
        }
        if (nodeTreeData[index]) {
            nodeTreeData = nodeTreeData[index].treeData ? nodeTreeData[index].treeData : [];
        }
    }
    return false;
}

function generateTreeData(rootTreeData: ComponentTreeData[], info: ComponentTreeInfo) {
    return info.type === 'add'
        ? addToTreeData(rootTreeData, info.data) ? +1 : 0
        : deleteFromTreeData(rootTreeData, info.data) ? -1 : 0;
}

export const setTreeData = {
    initData: {
        treeData: [],
        totalCompNums: 0,
        generatingTreeData: false
    },
    actions: {
        setTreeData(info: ComponentTreeInfo | ComponentTreeInfo[], {dispatch}: any) {
            dispatch('setGenerateTreeData', true);
            dispatch('generateTreeData', info);
        },
        generateTreeData(info: ComponentTreeInfo | ComponentTreeInfo[], {getState}: any) {
            let oldTreeData = getState('treeData');
            let totalCompNums = getState('totalCompNums');
            let newTreeData = oldTreeData.slice();

            if (!Array.isArray(info)) {
                totalCompNums += generateTreeData(newTreeData, info);
            }
            else {
                info.forEach(item => {
                    totalCompNums += generateTreeData(newTreeData, item);
                });
            }
            return builder()
                .set('totalCompNums', totalCompNums)
                .set('treeData', JSON.parse(JSON.stringify(newTreeData)));
        },
        setGenerateTreeData(start: boolean) {
            return builder().set('generatingTreeData', start);
        }
    }
};
