/**
 * @file
 */
import {builder} from 'san-update';

export const setWsDisconnected = {
    initData: {
        wsDisconnected: false
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        setWsDisconnected(wsDisconnected: boolean) {
            return builder().set('wsDisconnected', wsDisconnected);
        }
    }
};