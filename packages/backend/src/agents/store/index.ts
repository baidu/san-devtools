import Bridge from '@shared/Bridge';
import {DevToolsHook, Component} from '../../hook';
import Agent from '../Agent';
import {SAN_STORE_HOOK} from '../../constants';
import CircularJSON from '@shared/utils/circularJSON';
import {
    STORE_SET_MUTATION_INFO,
    STORE_SET_DATA, STORE_GET_DATA,
    STORE_DATA_CHANGED,
    STORE_DISPATCH,
    STORE_TIME_TRAVEL,
    STORE_GET_PARENTACTION,
    STORE_SET_PARENTACTION
} from '@shared/protocol';
import {storeDecorator} from './storeDecorator';
import {IStore} from './types';
import {getStrFromObject} from './utils';
import {StoreService} from './store';


export class StoreAgent extends Agent {
    guidIndex: number;
    constructor(hook: DevToolsHook<any>, bridge: Bridge) {
        super(hook, bridge);
        this.guidIndex = 0;
    }

    setupHook() {
        // 生命周期监听
        SAN_STORE_HOOK.map(evtName => {
            this.hook.on(evtName, data => {
                this.onHookEvent(evtName, data);
            });
        });
    }
    onHookEvent(evtName: string, data: any): void {
        switch (evtName) {
            /**
             * 页面 import san-store: 创建默认的 store，new Store({name: '__default__'})
             */
            case 'store-default-inited': {
                let store = data.store || data.defaultStore;
                if (store) {
                    storeDecorator.handler(store);
                    if (store.name !== '__default__') {
                        console.warn('[SAN_DEVTOOLS]: there is must be something bad has happened in san-store');
                        return;
                    }
                    this.setStore(store);
                }
                break;
            }
            /**
             * connectStore(store) 调用：与 store 创建链接
             */
            case 'store-connected': {
                let {store} = data;
                this.setStore(store);
                break;
            }
            /**
             * connect({mapStates, mapActions})(<组件>),组件 inited 生命周期
             * https://github.com/baidu/san-store/blob/05894698c8640d6c8cf92139819e2d6c94164499/src/connect/createConnector.js#L116
             * 1. 监听 store state change: store-listened
             * 2. store-comp 初始化完成: store-comp-inited
             * 3. 组件生命周期初始化触发: inited
             */
            case 'store-listened': {
                // 后续立马会执行 store-comp-inited
                break;
            }
            case 'store-comp-inited': {
                let {
                    mapStates,
                    mapActions,
                    store,
                    component,
                } = data;
                let storeService = this.setStore(store);
                storeService.collectMapStatePath(mapStates);
                this.sendToFrontend(STORE_DATA_CHANGED, '');
                this.setStoreComponentData(component, false, mapStates, mapActions, storeService.storeName);
                break;
            }
            /**
             * 调用 store.dispatch 触发 store 的值的改变
             * 需要记录下来，作为 store tree 的展示内容，但是当变动频繁的时候
             */
            case 'store-dispatch': {
                let {store} = data;
                this.setStore(store);
                break;
            }
            case 'store-dispatched': {
                let {store} = data;
                let storeService = this.setStore(store);
                let mutation = storeService.getMutationData(data.actionId, data.diff);
                if (mutation !== null) {
                    this.sendToFrontend(STORE_SET_MUTATION_INFO, CircularJSON.stringify(mutation));
                }
                break;
            }
            /**
             * store-comp 包裹组件卸载
             * https://github.com/baidu/san-store/blob/05894698c8640d6c8cf92139819e2d6c94164499/src/connect/createConnector.js#L161
             * 1. 取消监听 store state change: store-unlistened
             * 2. store-comp 卸载完成: store-comp-disposed
             * 3. 组件生命周期初始化触发: disposed
             */
            case 'store-unlistened': {
                // 后续立马会执行 store-comp-disposed
                break;
            }
            case 'store-comp-disposed': {
                let {
                    store,
                    component
                } = data;
                this.setStore(store);
                this.sendToFrontend(STORE_DATA_CHANGED, '');
                this.setStoreComponentData(component, true);
                break;
            }
            default: break;
        }
    }
    addListener() {
        this.bridge.on(STORE_DISPATCH, message => {
            const {actionName, storeName, payload} = message;
            const store = this.storeMap.get(storeName);
            store.dispatchAction(actionName, payload);
        });
        this.bridge.on(STORE_GET_DATA, message => {
            const {id, storeName} = message || {};
            if (!id || !storeName) {
                return;
            }
            const store = this.storeMap.get(storeName);
            let storeData = store.getStoreStateById(id);
            this.sendToFrontend(STORE_SET_DATA, CircularJSON.stringify(storeData));
        });
        this.bridge.on(STORE_TIME_TRAVEL, message => {
            if (message && message.id && message.storeName) {
                const {id, storeName} = message;
                const store = this.storeMap.get(storeName);
                store.travelTo(id);
            }
        });
        this.bridge.on(STORE_GET_PARENTACTION, message => {
            if (message && message.id && message.storeName) {
                const {id, storeName} = message;
                const store = this.storeMap.get(storeName);
                const actions = store.getAsyncActionData(id);
                this.sendToFrontend(STORE_SET_PARENTACTION, CircularJSON.stringify(actions));
            }
        });
    }

    private get storeMap() {
        return this.hook && this.hook.storeMap;
    }

    /**
     * 获取 store 对应的名字
     * @param store store 实例
     */
    private getStoreName(store: IStore) {
        let {name} = store;
        let fakeName = '';
        for (let [key, storeData] of this.storeMap.entries()) {
            if (storeData.store === store) {
                fakeName = key;
                break;
            }
        }
        fakeName = fakeName || name;
        if (!fakeName) {
            fakeName = `Store${++this.guidIndex}-NamedBySanDevtools`;
        }
        return fakeName;
    }

    /**
     * 更新 componentId，store 实例，存储 storeData
     * @param store store 实例
     */
    private setStore(store: IStore) {
        let fakeName = this.getStoreName(store);
        let storeService = this.storeMap.get(fakeName);
        if (!storeService) {
            storeService = new StoreService(store, fakeName);
            // 构建 data
            this.storeMap.set(fakeName, storeService);
        }
        else {
            storeService.store = store;
        }
        return storeService;
    }

    /* -------------------------------------------------------------------------- */
    /*                         handle action and mutation                         */
    /* -------------------------------------------------------------------------- */
    /**
     * 由于 component inited 在 attach 之前，所以可以先存下来，用于构建 componentTree 的阶段
     * 构造并存储 storeComponentData
     * @param mapStates 组件对应的 state
     * @param mapActions 组件对应的 actions
     * @param component 组件实例
     */
    private setStoreComponentData(
        component: Component,
        del: boolean,
        mapStates?: Record<string, any>,
        mapActions?: Record<string, any>,
        storeName?: string
    ) {
        const hook = this.hook;
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
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new StoreAgent(hook, bridge);
}
