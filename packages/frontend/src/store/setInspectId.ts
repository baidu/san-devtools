/**
 * @file
 */
import {builder} from 'san-update';

export const setInspectId = {
    initData: {
        inspectedIdPathStr: ''
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        setInspectId(inspectedIdPath: number[] | string) {
            if (typeof inspectedIdPath === 'string') {
                return builder().set('inspectedIdPathStr', inspectedIdPath);
            }
            let inspectedIdPathStr = inspectedIdPath.join(',');
            return builder().set('inspectedIdPathStr', inspectedIdPathStr);
        }
    }
};