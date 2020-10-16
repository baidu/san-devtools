/**
 * @file
 */
import {builder} from 'san-update';

export const sanVersion = {
    initData: {
        sanVersion: ''
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        setSanVersion(version: string) {
            return builder().set('sanVersion', version);
        }
    }
};