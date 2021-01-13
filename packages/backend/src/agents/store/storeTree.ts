import {DevToolsHook, Component} from '../../hook';

let guidIndex = 0;
interface StoreData {
    storeName: string;
    raw: any;
    actions: any[];
    components?: Record<string, any>;
}

interface ActionControl {
    list: any[];
    len: number;
    index: any;
    store: any; // store 实例
}

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
    changedTarget: string;
}

interface ActionData {
    id: number; // action id
    name: string; // action 名字
    parentId: number; // 父 action id
    status: string; // 状态
    actions: ActionData[]; // 子 action 列表
}
interface ComponentOption {
    componentId: string;
    type: 'delete' | 'add';
}

/**
 * 获取 store 对应的名字
 * @param storeMap 存储 storeData 的 map
 * @param store store 实例
 */
function getStoreName(storeMap: Map<string, any>, store: any) {
    let {name} = store;
    let fakeName = '';
    for (let [key, storeData] of storeMap.entries()) {
        if (storeData.store === store) {
            fakeName = key;
            break;
        }
    }
    fakeName = fakeName || name;
    if (!fakeName) {
        fakeName = `Store${++guidIndex}-NamedBySanDevtools`;
    }
    return fakeName;
}

/**
 * 获取 actions 数据，名称 + 函数字符串
 * @param actions actions 函数
 */
export function getActionsStr(actions: {[name: string]: Function}) {
    return Object.entries(actions).map(([name, fn]: [string, Function]) => {
        return {
            name,
            fn: fn && fn.toString()
        };
    });
}

/**
 * 获取 storeData
 * @param store
 * @param storeName
 * @param canGetAction 是否处理 actions
 */
export function genStoreData(store: any, storeName: string, canGetAction: boolean): StoreData {
    return {
        storeName,
        raw: store.raw,
        actions: canGetAction ? getActionsStr(store.actions) : []
    };
}

/**
 * 从 hook 获取 store 数据
 * @param hook
 * @param storeName
 */
export function getStoreData(hook: DevToolsHook<{}>, storeName: string) {
    let store = hook.storeMap.get(storeName);
    if (store && store.storeData) {
        return store.storeData;
    }
    return null;
}

/**
 * 当 connected 的组件挂载或者卸载的时候，从 store 相关的 components 中删除或者添加一个 conponentId
 * @param data
 * @param componentOption
 */
function handleComponent(data: any, componentOption: ComponentOption) {
    let {type, componentId} = componentOption;
    if (!data || !data.components || !componentOption) {
        return null;
    }
    switch (type) {
        case 'delete': {
            delete data.components[componentId];
            break;
        }
        case 'add': {
            data.components[componentId] = componentId;
            break;
        }
        default:
            break;
    }
    return data;
}

/**
 * 更新 componentId，store 实例，存储 storeData
 * @param hook
 * @param store store 实例
 * @param canGetAction 是否更新 storeData 中的 action，避免不必要的计算
 * @param componentOption 如何处理 componentId
 */
export function setStore(hook: DevToolsHook<{}>, store: any, canGetAction: boolean, componentOption?: ComponentOption) {
    let {storeMap} = hook;
    let fakeName = getStoreName(storeMap, store);
    let oldData = hook.storeMap.get(fakeName);
    let newStoreData: StoreData;
    if (!oldData) {
        newStoreData = genStoreData(store, fakeName, true);
        // 构建 data
        newStoreData.components = {};
        hook.storeMap.set(fakeName, {
            store,
            storeData: newStoreData
        });
    } else {
        let handleAction = !oldData.storeData || !oldData.storeData.actions || oldData.storeData.actions.length === 0 ? true : canGetAction; // eslint-disable-line
        newStoreData = genStoreData(store, fakeName, handleAction);
        !handleAction && oldData.storeData && (newStoreData.actions = oldData.storeData.actions);
        // 更新 data
        newStoreData.components = oldData.storeData.components;
        componentOption && (newStoreData = handleComponent(newStoreData, componentOption));
        hook.storeMap.set(fakeName, {
            store,
            storeData: newStoreData
        });
    }
    return newStoreData;
}

/**
 * 格式化时间
 * @param time 毫秒数
 */
function formateTime(time: number) {
    if (!time || time < 0) {
        return '...';
    }
    let date = new Date(time);
    return [date.getMinutes(), date.getSeconds(), date.getMilliseconds()].join(':');
}

/**
 * 获取 action 的『开始时间-结束时间』字符串
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
function getTimeRange(startTime: number | undefined, endTime: number | undefined) {
    let start = '';
    let end = '';
    if (startTime) {
        start = formateTime(startTime);
    }
    if (endTime) {
        end = formateTime(endTime);
    }
    if (!start && !end) {
        return '';
    }
    return `${start}-${end}`;
}

function getActionInfo(data: any) {
    let actionId = data.actionId;
    let actionCtrl = data.store.actionCtrl;
    return actionCtrl.getById(+actionId);
}

/**
 * 获取触发的 action 的基本信息
 * @param data
 * @param storeName store 名称
 * @return targetStr 改变的 store 的 key
 */
function getChangedTarget(diffData: any[]) {
    let targetStr = '';
    if (!diffData || !Array.isArray(diffData)) {
        return targetStr;
    }
    diffData.reduce((pre, cur) => {
        let target = cur.target;
        if (target && Array.isArray(target)) {
            targetStr += target.join('.') + ';';
        }
    }, targetStr);
    return targetStr;
}

/**
 * 获取触发的 action 的基本信息
 * @param data
 * @param storeName store 名称
 */
export function getMutationData(data: any = {}, storeName: string): MutationData | null {
    let actionInfo = getActionInfo(data);
    if (!actionInfo) {
        return null;
    }
    let {
        id = '-1',
        name = '',
        parentId = undefined,
        childs = [],
        startTime = -1,
        payload = '',
        // selfDone = false,
        done = false,
        endTime = -1
    } = actionInfo;

    // 如果是异步开始了,先存储下来，后面再判断是否是异步的
    let diffData;
    // eslint-disable-next-line
    if (data.hasOwnProperty('diff')) {
        diffData = data.diff;
    }

    let timeRange = getTimeRange(startTime, endTime);
    let status = !!done ? 'done' : 'pendding';
    // mutation backend 不需要存储，在点开 mutation 详情面板并修改数据的时候直接找到 store name 以及相关数据直接操作 store
    return {
        storeName: storeName,
        extras: [
            {
                text: timeRange // 持续时间
            },
            {
                text: status // 展示状态用
            }
        ],
        timeRange,
        status: status,
        childs,
        displayName: name,
        payload,
        id,
        parentId,
        diff: diffData ? diffData : null,
        changedTarget: getChangedTarget(diffData)
    };
}

interface IDispatchMsg {
    storeName: string;
    actionName: string;
    payload: any;
}

/**
 * 触发 action
 * @param hook
 * @param message
 */
export function dispatchAction(hook: DevToolsHook<{}>, message: IDispatchMsg) {
    let {storeName, actionName, payload} = message;
    if (!hook.storeMap.has(storeName)) {
        return;
    }
    let store = hook.storeMap.get(storeName).store;
    store.dispatch(actionName, payload);
}

function getStrFromObject(mapData: Record<string, any>) {
    if (Object.prototype.toString.call(mapData) === '[object Object]') {
        return Object.entries(mapData).map(item => {
            let value = '-';
            switch (typeof item[1]) {
                case 'string': {
                    value = item[1];
                    break;
                }
                case 'function' : {
                    value = item[1].name;
                }
                default: break;
            }
            return `${item[0]}: ${value},`;
        });
    }
    return;
}

/**
 * 由于 component inited 在 attach 之前，所以可以先存下来，用于构建 componentTree 的阶段
 * 构造并存储 storeComponentData
 * @param mapStates 组件对应的 state
 * @param mapActions 组件对应的 actions
 * @param component 组件实例
 */
export function setStoreComponentData(
    hook: DevToolsHook<{}>,
    component: Component,
    del: boolean,
    mapStates?: Record<string, any>,
    mapActions?: Record<string, any>,
    storeName?: string
) {
    let {id} = component;
    if (del) {
        hook.storeComponentMap.delete(id + '');
        return;
    }
    let mapActionsKeys = mapActions && getStrFromObject(mapActions);
    let mapStatesArr = mapStates ? getStrFromObject(mapStates) : undefined;
    let componentData = {
        mapStates: mapStatesArr,
        mapActionsKeys,
        storeName,
        extra: {
            text: 'connected'
        }
    };
    hook.storeComponentMap.set(id + '', componentData);
}