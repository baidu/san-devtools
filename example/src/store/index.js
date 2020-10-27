/**
 * @file 主要用于 bridge 的 listener
 */
import {Store, connect as sanConnect} from 'san-store';
import {setCount} from './setCount';
import {builder} from 'san-update';

function getInitData(...stores) {
    let initData = {};
    let actions = {};
    let storeOptions = {
        initData,
        actions
    };
    return stores.reduce((pre, cur) => {
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
let store = new Store(getInitData(
    setCount
));
let store1 = new Store({
    name: 'store1',
});
let store2 = new Store({
    name: 'store1',
});
store.addAction('changeUserName', name => builder().set('userName', name));
// 创建一个与 store 的链接
const connectStore = sanConnect.createConnector(store);
export {
    store,
    connectStore
};
