/**
 * @file
 */
import {builder} from 'san-update';
let storeMap = new Map();

interface StoreData {
    storeName: string;
    raw: any;
    actions: Array<{
        name: string;
        fn: string;
    }>;
    components?: Record<string, any>;
}

interface IActionData {
    id: number; // action id
    name: string; // action 名字
    parentId: number; // 父 action id
    payload: any; // 接收的值
    timeRange: string;
    storeName: string;
}

export const setStoreData = {
    initData: {
        storeData: null,
        actionCallStack: []
    },
    actions: {
        setStoreData(storeData: StoreData, {getState}: any) {
            let {storeName} = storeData;
            let selectedStoreName = getState('selectedStoreName');
            storeMap.set(storeName, storeData);
            if (selectedStoreName === storeName) {
                return builder().set('storeData', storeData);
            }
        },
        setStoreDataOnClickMutation(storeName: string) {
            if (storeMap.has(storeName)) {
                return builder().set('storeData', storeMap.get(storeName));
            }
        },
        setActionCallStack(callList: IActionData[]) {
            return builder().set('actionCallStack', callList);
        }
    }
};
