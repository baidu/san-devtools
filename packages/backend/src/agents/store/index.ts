import Bridge from '@shared/Bridge';
import {DevToolsHook} from '../../hook';
import Agent from '../Agent';
import {SAN_STORE_HOOK} from '../../constants';
import {
    setStore,
    getMutationData,
    dispatchAction,
    setStoreComponentData,
    getStoreData
} from './storeTree';
import CircularJSON from '@shared/utils/circularJSON';

export class StoreAgent extends Agent {
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
                let {store} = data;
                if (store.name !== '__default__') {
                    console.warn('[SAN_DEVTOOLS]: there is must be something bad has happened in san-store');
                    return;
                }
                setStore(this.hook, store, true);
                break;
            }
            /**
             * connectStore(store) 调用：与 store 创建链接
             */
            case 'store-connected': {
                // 存储 store 实例
                // mapStates, mapActions 在这没啥用
                let {store} = data;
                setStore(this.hook, store, true);
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
                // 选择静默，否则更新 store 实例，因为后续立马会执行 store-comp-inited
                break;
            }
            case 'store-comp-inited': {
                // actions 函数不需要更新
                // 展示到组件上
                let {
                    mapStates,
                    mapActions,
                    store,
                    component,
                } = data;
                let storeData = setStore(this.hook, store, false, {componentId: component.id, type: 'add'});
                this.sendToFrontend('Store.storeChanged', '');
                // 更新 component 信息
                setStoreComponentData(this.hook, component, false, mapStates, mapActions, storeData.storeName);
                break;
            }
            /**
             * 调用 store.dispatch 触发 store 的值的改变
             * 需要记录下来，作为 store tree 的展示内容，但是当变动频繁的时候
             */
            case 'store-dispatch':
            case 'store-dispatched': {
                // actions 函数不需要更新
                // 构建一个 storetree
                let {store} = data;
                // 更新 store
                let storeData = setStore(this.hook, store, false);
                // 发送 mutation 数据
                let mutation = getMutationData(data, storeData.storeName);
                this.sendToFrontend('Store.setMutationTreeData', CircularJSON.stringify(mutation));
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
                // 选择静默，否则更新 store 实例，因为后续立马会执行 store-comp-disposed
                break;
            }
            case 'store-comp-disposed': {
                // 需要更新 store 实例
                let {
                    store,
                    component
                } = data;
                setStore(this.hook, store, false, {componentId: component.id, type: 'delete'});
                this.sendToFrontend('Store.storeChanged', '');
                setStoreComponentData(this.hook, component, true);
                break;
            }
            /**
             * 调用 store.addAction 触发 store 的值的改变
             */
            case 'store-action-added': {
                // 更新 actions 函数
                // 需要更新 store 实例
                let {store} = data;
                setStore(this.hook, store, true);
                this.sendToFrontend('Store.storeChanged', '');
                break;
            }
            default: break;
        }
    }
    addListener() {
        this.bridge.on('Store.dispatchAction', message => {
            dispatchAction(this.hook, message);
        });
        this.bridge.on('Store.getStoreData', message => {
            let storeData = getStoreData(this.hook, message);
            this.sendToFrontend('Store.setStoreData', CircularJSON.stringify(storeData));
        });
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new StoreAgent(hook, bridge);
}
