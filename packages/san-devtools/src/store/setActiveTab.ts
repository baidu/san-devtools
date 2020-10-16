/**
 * @file
 */
import {builder} from 'san-update';

export const setActiveTab = {
    initData: {
        activeTab: 'component'
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        setActiveTab(activeTab: string) {
            return builder().set('activeTab', activeTab);
        }
    }
};