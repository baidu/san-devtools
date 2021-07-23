/**
 * @file
 */
export interface IStoreData {
    storeName: string;
    raw: any;
    components?: Record<string, any>;
}

export interface IMutationData {
    storeName: string;
    extras: Array<{text: string}>;
    timeRange: string;
    childs: any[];
    displayName: string;
    payload: any;
    id: string;
    parentId: string;
    diff: Record<string, any>;
    changedTarget: string;
}

export interface IActionData {
    id: number; // action id
    name: string; // action 名字
    parentId: number; // 父 action id
    payload: any; // 接收的值
    timeRange: string;
    storeName: string;
}

export interface IDispatchMsg {
    actionName: string;
    payload: any;
}

export interface IStore {
    [key: string]: any;
}

export interface IDiffItem {
    $change: 'change' | 'add' | 'remove';
    newValue: any;
    oldValue: any;
    target: string[];
}
export interface IStateLog {
    oldValue: any;
    newValue: any;
    id: string;
    diff: IDiffItem[];
}

// type TCollectType = 'store-comp-inited' | 'store-comp-disposed';
export interface IDiffItem {
    $change: 'change' | 'add' | 'remove';
    newValue: any;
    oldValue: any;
    target: string[];
}
