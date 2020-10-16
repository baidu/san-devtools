/**
 * @file
 */
// 接收组件树的数据：不包含组件实例，只用于展示以及组件的唯一标记
const TREE_DATA_LISTENER = 'Component.setTreeData';
// 接收版本号
const SAN_VERSION_LISTENER = 'San.setSanVersion';
// 接收组件的详情
const COMPONENT_INFO_LISTENER = 'Component.setComponentInfo';
// 接收 mutation
const MUTATION_INFO_LISTENER = 'Store.setMutationTreeData';
// 接收 store
const STORE_INFO_LISTENER = 'Store.setStoreData';
// store 变化了
const STORE_DATA_CHANGED = 'Store.storeChanged';
// 接收 history
const HISTORY_INFO_LISTENER = 'History.setHistory';
// 接收 message
const MESSAGE_INFO_LISTENER = 'Message.setMessage';
// 接收 event 事件
const EVENT_INFO_LISTENER = 'Event.setEvent';
// inspect component
const INSPECT_COMPONENT = 'Inspector.component';

// 后端已链接
const BACKEND_CONNECTED = 'SYSTEM:backendConnected';
// 后端断开链接
const BACKEND_DISCONNECTED = 'SYSTEM:backendDisconnected';

export {
    TREE_DATA_LISTENER,
    SAN_VERSION_LISTENER,
    COMPONENT_INFO_LISTENER,
    MUTATION_INFO_LISTENER,
    STORE_INFO_LISTENER,
    STORE_DATA_CHANGED,

    HISTORY_INFO_LISTENER,

    BACKEND_CONNECTED,
    BACKEND_DISCONNECTED,

    MESSAGE_INFO_LISTENER,
    EVENT_INFO_LISTENER,

    INSPECT_COMPONENT
};
