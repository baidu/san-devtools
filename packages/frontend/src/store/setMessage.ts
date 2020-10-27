/**
 * @file
 */
import {builder} from 'san-update';

interface MessageData {
    key: number;
    time: string;
    payload: any;
    event: string;
    sender: {
        id: string;
        componentName: string;
    };
    receiver: {
        id: string;
        componentName: string;
    };
}

export const setMessage = {
    initData: {
        messageInfoList: []
    },
    actions: {
        setMessage(message: MessageData) {
            return builder().apply('messageInfoList', (oldValue: MessageData[]) => {
                let arr = oldValue.slice();
                arr.unshift(message);
                return arr;
            });
        },
        clearMessage(index?: number) {
            if (typeof index === 'undefined') {
                return builder().set('messageInfoList', []);
            }
            return builder().removeAt('messageInfoList', index);
        }
    }
};