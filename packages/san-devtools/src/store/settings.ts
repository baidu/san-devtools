/**
 * @file
 */
import {builder} from 'san-update';
import {SETTINGS} from '@san-devtools/utils/index';

export const settings = {
    initData: {
        settings: {
            storeReadOnly: false,
            componentReadOnly: false,
            eventReadOnly: false,
            messagesReadOnly: false
        }
    },
    actions: {
        // 在接收到版本事件的时候会往 store 中注入『版本信息』
        settings(settingData: number) {
            let storeReadOnly;
            let componentReadOnly;
            let eventReadOnly;
            let messagesReadOnly;
            storeReadOnly = !!(+settingData & SETTINGS['Setting:store']);
            componentReadOnly = !!(+settingData & SETTINGS['Setting:component']);
            eventReadOnly = !!(+settingData & SETTINGS['Setting:event']);
            messagesReadOnly = !!(+settingData & SETTINGS['Setting:messages']);
            return builder().set('settings', {
                storeReadOnly,
                componentReadOnly,
                eventReadOnly,
                messagesReadOnly
            });
        }
    }
};
