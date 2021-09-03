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

interface IDeleteInfo {
    displayName: string;
    id: string;
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
            });
        },
        clearTreeData(payload: IDeleteInfo) {
            const {displayName, id} = payload;
            return builder().apply('mutationTreeData', (oldValue: MutationTreeDataItem[]) => {
                if (typeof id === 'undefined' && typeof displayName === 'undefined') {
                    return [];
                }
                let arr = oldValue.slice();
                // eslint-disable-next-line @typescript-eslint/prefer-for-of
                for (let s = 0; s < arr.length; s++) {
                    const store = arr[s];
                    if (store.displayName === displayName) {
                        arr.splice(s, 1);
                        return arr;
                    }
                    else if (id) {
                        if (Array.isArray(store.treeData)) {
                            // eslint-disable-next-line @typescript-eslint/prefer-for-of
                            for (let i = 0; i < store.treeData.length; i++) {
                                const item = store.treeData[i];
                                if (item.id === id) {
                                    store.treeData.splice(i, 1);
                                    return arr;
                                }
                            }
                        }
                    }
                }
                return arr;
            });
        }
    }
};
