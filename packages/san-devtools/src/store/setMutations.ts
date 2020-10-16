/**
 * @file
 */
import {builder} from 'san-update';

interface MutationData {
    storeName: string;
    extras: Array<{text: string}>;
    timeRange: string;
    status: string;
    childs: any[];
    displayName: string;
    payload: any;
    id: string;
    parentId: string;
    diff: Record<string, any>;
}

interface MutationTreeDataItem {
    displayName: string;
    treeData: MutationData[];
    len: number; // 计数，省掉遍历查查找
    index: {[key: string]: number}; // key 是 actionId， value 是在数组中的位置
}

export const setMutationTreeData = {
    initData: {
        mutationTreeData: []
    },
    actions: {
        setMutationTreeData(mutation: MutationData) {
            let {storeName, id} = mutation;
            return builder().apply('mutationTreeData', (oldValue: MutationTreeDataItem[]) => {
                let arr = oldValue.slice();
                for (let item of arr) {
                    if (item.displayName === storeName) {
                        if (typeof item.index[id] === 'number') {
                            // 主要用于异步action的替换
                            item.treeData.splice(item.len - item.index[id], 1, mutation);
                        } else {
                            item.index[id] = ++item.len;
                            item.treeData.unshift(mutation);
                        }
                        return arr;
                    }
                }
                // 如果还没有这个 store 树
                arr.push({
                    displayName: storeName,
                    treeData: [mutation],
                    len: 1, // 计数，省掉遍历查查找
                    index: {[id]: 1} // key 是 actionId， value 是在数组中的位置
                });
                return arr;
            }).set('storeChanged', true);
        }
    }
};
