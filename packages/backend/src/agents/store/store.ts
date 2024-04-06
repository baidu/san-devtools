/**
 * @file
 */
import {IMutationData, IActionData, IStore, IDiffItem, IStateLog} from './types';
import {getTimeRange, getChangedTarget, parseName, getDiff} from './utils';

interface IStoreService {
    dispatchAction: (actionName: string, payload: any) => void;
    getAsyncActionData: (id: string, storeName: string) => IActionData[];
    getMutationData: (id: string, diff: IDiffItem[] | null | undefined) => IMutationData | null;
    getStoreStateById: (actionId: string) => null | {storeName: string, raw: any};
    travelTo: (id: string) => void;
    collectMapStatePath: (mapStates: Record<string, any>) => void;
}

export class StoreService implements IStoreService {
    _store: IStore;
    storeName: string;
    paths: Record<string, any>;
    constructor(store: IStore, storeName?: string) {
        this.store = this._store = store;
        this.storeName = storeName || store.name;
        this.paths = {};
    }

    set store(value: Record<string, any>) {
        this._store = value;
        this.decorateStore();
    }

    get store() {
        return this._store;
    }

    dispatchAction(actionName: string, payload: any) {
        if (!this.store) {
            return;
        }
        this.store.dispatch(actionName, payload);
    }

    getAsyncActionData(id: string) {
        const store = this.store;
        const actionId = id;
        const actions: IActionData[] = [];
        if (!actionId || !store) {
            return actions;
        }
        let curId = actionId;
        while (curId) {
            let actionInfo = this.getActionInfo(curId);
            if (!actionInfo) {
                break;
            }
            let {
                id = '-1',
                name = '',
                parentId = undefined,
                startTime = -1,
                payload = '',
                endTime = -1
            } = actionInfo;
            let timeRange = getTimeRange(startTime, endTime);
            actions.unshift({
                storeName: this.storeName,
                timeRange,
                name,
                payload,
                id,
                parentId
            });
            curId = parentId;
        }
        return actions;
    }

    getMutationData(mutationId: string, diff: IDiffItem[] | null | undefined): IMutationData | null {
        let actionInfo = this.getActionInfo(mutationId);
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
            endTime = -1
        } = actionInfo;

        let timeRange = getTimeRange(startTime, endTime);
        let mutationUseless = 'useless';
        // 同步的 action，触发了 mutaion，但是数据没有变化
        if (Array.isArray(diff) && diff.length > 0) {
            mutationUseless = '';
        }
        // mutation backend 不需要存储，在点开 mutation 详情面板并修改数据的时候直接找到 store name 以及相关数据直接操作 store
        return diff === null ? null : {
            storeName: this.storeName,
            extras: [
                {
                    text: mutationUseless // 展示状态用
                }
            ],
            timeRange,
            childs,
            displayName: name,
            payload,
            id,
            parentId,
            diff: diff ? diff : null,
            changedTarget: getChangedTarget(diff)
        } as IMutationData;
    }

    getStoreStateById(actionId: string) {
        const store = this.store;
        const storeName = this.storeName;
        if (!store || !store.stateChangeLogs) {
            return null;
        }
        let state = null;
        if (actionId) {
            state = store.stateChangeLogs.find((item: any) => actionId === item.id);
        }
        else {
            state = store.raw;
        }
        return state ? {
            storeName,
            raw: state.newValue
        } : null;
    }

    private getActionInfo(actionId: string) {
        let store = this.store;
        if (store.actionCtrl) {
            // san-store 2.0.3 以下 https://github.com/baidu/san-store/releases/tag/2.0.3
            return store.actionCtrl.getById(+actionId);
        }
        else if (store.actionInfos && store._getActionInfo) {
            // san-store 2.1.0+ https://github.com/baidu/san-store/commit/a8ade597cf8b00906c95adf9c628a9bded7d3d38
            return store._getActionInfo(actionId);
        }
        return null;
    }

    /* -------------------------------------------------------------------------- */
    /*                                 time travel                                */
    /* -------------------------------------------------------------------------- */
    /**
     * decorateStore
     * @returns void
     */
    private decorateStore() {
        const store = this.store;
        if ('sanDevtoolsRaw' in store) {
            return;
        }
        let storeProto = Object.getPrototypeOf(store);
        const desc = 'dispatch';
        const oldProtoFn = storeProto[desc];
        storeProto[desc] = function (...args: any) {
            !this.log && (this.log = true);
            this.traveledState = null;
            return oldProtoFn.call(this, ...args);
        };
        store.sanDevtoolsRaw = store.raw;
        Object.defineProperty(store, 'raw', {
            get() {
                if (store.traveledState) {
                    return store.traveledState;
                }
                return this.sanDevtoolsRaw;
            },
            set(state) {
                this.sanDevtoolsRaw = state;
            }
        });
    }

    private replaceState(state: Record<string, any>) {
        this.store.traveledState = state;
    }

    collectMapStatePath(mapStates: Record<string, any>) {
        if (Object.prototype.toString.call(mapStates).toLocaleLowerCase() !== '[object object]') {
            return;
        }
        Object.values(mapStates).reduce((prev: Record<string, any>, cur: string | string[]) => {
            let key = '';
            let value = [];
            if (Array.isArray(cur)) {
                key = cur.join('.');
                value = cur;
            }
            else if (typeof cur === 'string') {
                value = parseName(cur);
                key = value.join('.');
            }
            else if (typeof cur === 'function') {
                // TODO：处理 mapState 的 value 为函数
                return prev;
            }
            prev[key] = value;
            return prev;
        }, this.paths);
    }

    // 在 _fire 的时候，如果组件将 store 的某个数据放到 computed，并且 computed 中触发了 dispatch
    // 那么 dispatch 的时候就应该将最新的值给填补回来
    travelTo(id: string) {
        const store = this.store;
        const paths = this.paths;
        if (!store || !store.stateChangeLogs || !paths) {
            return;
        }
        const state = this.getStateFromStateLogs(id);
        if (!state) {
            return;
        }
        const diffs = getDiff(state.newValue, store.traveledState, paths);
        this.replaceState(state.newValue);
        store._fire(diffs);
        return;
    }

    private getStateFromStateLogs(id: string) {
        const logs: IStateLog[] = this.store && this.store.stateChangeLogs;
        if (!Array.isArray(logs)) {
            return null;
        }
        return logs.find(item => id === item.id);
    }
}
