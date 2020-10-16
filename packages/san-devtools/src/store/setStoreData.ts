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

export const setStoreData = {
    initData: {
        storeData: null,
        storeChanged: true
    },
    actions: {
        setStoreData(storeData: StoreData, {getState, dispatch}: any) {
            let {storeName} = storeData;
            let selectedStoreName = getState('selectedStoreName');
            storeMap.set(storeName, storeData);
            if (selectedStoreName === storeName) {
                dispatch('setStoreChanged', false);
                return builder().set('storeData', storeData);
            }
        },
        setStoreDataOnClickMutation(storeName: string) {
            if (storeMap.has(storeName)) {
                return builder().set('storeData', storeMap.get(storeName));
            }
        },
        setStoreChanged(storeChanged: boolean) {
            return builder().set('storeChanged', storeChanged);
        }
    }
};