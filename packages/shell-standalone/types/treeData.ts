// 用于展示组件树的数据结构
// 涉及的事件：comp-attached，comp-detached，comp-route
export interface ComponentTreeData {
    id: number; // 不变的，san 决定
    displayName: string; // 组件更新的时候也不可能变化的
    extra: any[] | null; // 路由切换的时候会有组件的卸载挂载的事件，切换之前不会变化，用于展示路由信息，对应comp-router事件
    parentId: number; // 组件之间的关系只有在挂载/卸载的时候会变化
    treeData: ComponentTreeData[]; // 组件之间的关系只有在挂载/卸载的时候会变化
}

// 更新事件，store事件触发的时候需要保存到map里面，然后frontend发送消息获取组件信息的时候把下面的数据发送出去。
// frontend 单个组件信息面板数据结构：
// 触发时机为：1. 组件生命周期函数触发。2. 通过点击组件树面板某个组件主动获取
// 下面的属性名称与组件实例上的属性一一对应
export interface ComponentData {
    displayName: string; // 组件名称
    id: number; // 组件唯一标志，重要
    data: Record<string, any>; // 组件数据，重要
    messages: Record<string, any>; // 注册是消息名称，重要
    listeners: Record<string, any>; // watch?
    computed: Record<string, any>;
    computedDeps: Record<string, any>;

    slotChildren: any[];
    filters: Record<string, any>;
    nativeEvents: any[];
}

// 中间态
export interface ComponentDataBase {
    extra: any[] | null;// 用于展示路由信息，对应comp-router事件
    displayName: string; // 组件名称
    id: number; // 组件唯一标志，重要
    data: Record<string, any>; // 组件数据，重要
    messages: Record<string, any>; // 注册是消息名称，重要
    listeners: Record<string, any>; // watch?
    computed: Record<string, any>;
    computedDeps: Record<string, any>;

    idPath: number[]; // 辅助信息

    slotChildren: any[];
    filters: Record<string, any>;
    nativeEvents: any[];
}