/**
 * @file
 */
import {builder} from 'san-update';

interface ComponentTreeData {
    id: string;
    parentId: string | null;
    displayName: string;
    extras: any[];
    idPath: string[];
    treeData: ComponentTreeData[];
    ownerId: string;
    tagName: string;
    mapStates?: string[];
    mapActionsKeys?: string[];
    storeName?: string;
}

interface TreeData {
    totalCompNums: number;
    selectedComponentId: string;
    treeData: ComponentTreeData[];
}

export const setTreeData = {
    initData: {
        treeData: null,
        totalCompNums: 0
    },
    actions: {
        setTreeData(data: TreeData) {
            return builder()
                .set('treeData', data.treeData)
                .set('totalCompNums', data.totalCompNums);
        }
    }
};
