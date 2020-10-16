import {SAN_DEVTOOL_NAMESPACE, __DEBUG__} from './constants';
import EventEmitter, {EventType, Listener} from '@shared/EventEmitter';
import {SanComponent} from 'san/types';
export interface MutationItemDataExtra {
    text: string;
    icon: string;
    class: string;
}
export interface MutationItemData {
    text: string;
    secondaryText: string;
    extras: MutationItemDataExtra[];
}
export interface StoreTreeData {
    treeData: MutationItemData[];
}
export interface ComponentTreeData {
    id: string;
    parentId: string|null;
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

export interface ComponentData{
    data: Record<string, any>;
    messages: Record<string, any>;
    listeners: Record<string, any>;
    computed: Record<string, any>;
    computedDeps: Record<string, any>;
}

export interface HistoryData {
    component: {
        id: string;
        componentName: string;
    };
    time: string;
    data: any;
    event: string;
}
export interface RouteData {
    id: string;
    timestamp: number;
    routeData: string;
}

export interface DevToolsHook<T> {
    san: any;
    data: DevToolsHookData;
    history: string[];
    historyIndexBeforeFrontendCreated: number;
    routes: RouteData[];
    store: DevToolsHookStore;
    devtoolReady: boolean;
    sub(eventName: EventType, listener: Listener): void;
    on(eventName: EventType, listener: Listener): void;
    once(eventName: EventType, listener: Listener): void;
    off(eventName: EventType, listener: Listener): void;
    emit(eventName: EventType, data?: any): void;
    removeAllListeners(eventName?: EventType): void;
}

export interface DevToolsHookData {
    totalCompNums: number;
    selectedComponentId: string;
    treeData: ComponentTreeData[];
}
export interface DevToolsHookStore {
    stores: any;
    mutations: [];
    actions: [];
    treeData: StoreTreeData[];
}

export interface Component extends SanComponent<any> {
    el: any;
    id: string;
    parentId: string;
    idPath: string[];
    tagName: string;
    data: any;
    parent: any;
    parentComponent: any;
    source: any;
    owner: any;
    filters: any;
    messages: Record<string, any>;
    computedDeps: Record<string, any>;
    computed: Record<string, any>;
    listeners: Record<string, any>;
}

export type ComponentMap<T> = Map<string, Component>;

export class DevToolsHook<T> extends EventEmitter {
    // 是否为第一次触发。
    _initialEmitting: boolean = false;
    // 判断 devtool 面板是否 Ready。
    _frontendReady: boolean = false;
    _readyStack: Function[] = [];
    // 判定此挂钩的运行上下文。
    _this: any = null;
    componentMap: Map<string, Component> = new Map();
    // 由 San 传入的 san 对象。
    // https://github.com/baidu/san/blob/0a5f82a8d5bbd6bd85a47096866d26dbd1be0012/src/main.js
    san: any = null;
    // 与 devtool 保持同步的组件树。
    data: DevToolsHookData = {
        totalCompNums: 0,
        selectedComponentId: '',
        treeData: []
    };
    // sanDevtoolsContextMenuTargetIdPath 保存页面被选中的dom所在组件的 idPath
    sanDevtoolsContextMenuTargetIdPath: any = null;
    // 监听 message
    messageRecording: boolean = false;
    // 监听 event
    eventRecording: boolean = false;
    // 记录 San devtool 事件触发列表。
    recording: boolean = false;
    history: string[] = [];
    historyIndexBeforeFrontendCreated: number = 0;
    // TODO 这里是数组，要不要改成Map
    routes: RouteData[] = [];
    // Stores 对象及相关信息，与 devtool 保持同步的 mutation list。
    storeMap: Map<string, any> = new Map();
    storeComponentMap: Map<string, any> = new Map();
    sub(eventName: EventType, listener: Listener) {
        this.on(eventName, listener);
        return () => this.off(eventName, listener);
    }
    _flushReadyStack() {
        if (this._readyStack.length !== 0) {
            let cb;
            while ((cb = this._readyStack.pop())) {
                cb(this);
            }
        }
    }
    ready(fn: Function, stack: boolean = true) {
        // 需要判断下san是否已经ready
        if (this._frontendReady && this.san) {
            this._flushReadyStack();
            fn(this);
        } else {
            if (stack) {
                this._readyStack.push(fn);
            } else {
                this._readyStack.unshift(fn);
            }
        }
    }
}

export function install(target: any) {
    // eslint-disable-next-line
    if (target.hasOwnProperty(SAN_DEVTOOL_NAMESPACE)) {
        // eslint-disable-next-line
        alert('[SAN_DEVTOOLS]: If there is an old SAN_TOOL in your app please uninstall it, after that reload your app!');
        return null;
    }

    const sanHook: DevToolsHook<any> = new DevToolsHook();
    // 初始化
    // https://github.com/baidu/san/blob/0a5f82a8d5bbd6bd85a47096866d26dbd1be0012/src/main.js#L218
    // https://github.com/baidu/san/blob/d5451bc1cad8ed038127a3c6a83b4c018ac530dc/src/util/emit-devtool.js#L28
    sanHook.on('san', san => {
        if (!sanHook.san && san) {
            sanHook.san = san;
            if (__DEBUG__) {
                console.log('San is hooked, version is ' + san.version);
            }
        }
    });

    // TODO: 1. 这里需要添加事件监听，将component，store等事件全部都收集起来

    Object.defineProperty(target, SAN_DEVTOOL_NAMESPACE, {
        configurable: true,
        get() {
            sanHook._this = this;
            return sanHook;
        }
    });

    Object.defineProperty(sanHook, 'devtoolReady', {
        configurable: true,
        get() {
            return sanHook._frontendReady;
        },
        set(value) {
            sanHook._frontendReady = !!value;
            sanHook.historyIndexBeforeFrontendCreated = sanHook.history.length;
            if (!!value) {
                sanHook._flushReadyStack();
            }
            if (__DEBUG__) {
                console.log('devtool panel created');
            }
        }
    });
    return sanHook;
}