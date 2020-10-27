/**
 * @file 主要用于 bridge 的 listener
 */
import {sanVersion} from './sanVersion';
import {bridge} from './setBridge';
import {setTreeData} from './setTreeData';
import {setComponentInfo} from './setComponentInfo';
import {setSelectedComponentBaseInfo} from './setSelectedComponentBaseInfo';
import {setMutationTreeData} from './setMutations';
import {setSelectedMutationInfo} from './setSelectedMutationInfo';
import {setStoreData} from './setStoreData';
import {setHistory} from './setHistory';
import {setWsDisconnected} from './setWsDisconnected';
import {setMessage} from './setMessage';
import {setEvent} from './setEvent';
import {settings} from './settings';
import {setInspectId} from './setInspectId';
import {setActiveTab} from './setActiveTab';

import {EnhancedStore, sanConnect, actionCreator, StoreItem} from './resetFactory';

function getInitData(...stores: StoreItem[]) {
    let initData = {};
    let actions = {};
    let storeOptions = {
        initData,
        actions
    };
    return stores.map(actionCreator).reduce((pre: StoreItem, cur) => {
        return {
            initData: {
                ...pre.initData,
                ...cur.initData
            },
            actions: {
                ...pre.actions,
                ...cur.actions
            }
        };
    }, storeOptions);
}

// 创建 store 实例
let store = new EnhancedStore(getInitData(
    sanVersion,
    bridge,
    setTreeData,
    setComponentInfo,
    setSelectedComponentBaseInfo,
    setMutationTreeData,
    setSelectedMutationInfo,
    setStoreData,
    setHistory,
    setWsDisconnected,
    setMessage,
    setEvent,
    settings,
    setInspectId,
    setActiveTab
));
// 创建一个与 store 的链接
const connectStore = sanConnect.createConnector(store);
export {
    store,
    connectStore
};
