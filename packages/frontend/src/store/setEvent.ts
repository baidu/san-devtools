/**
 * @file
 */
import {builder} from 'san-update';
interface EventData {
    key: number;
    time: string;
    payload: any;
    event: string;
    component: {
        id: string;
        componentName: string;
    };
}


export const setEvent = {
    initData: {
        eventInfoList: []
    },
    actions: {
        setEvent(event: EventData) {
            return builder().apply('eventInfoList', (oldValue: EventData[]) => {
                let arr = oldValue.slice();
                arr.unshift(event);
                return arr;
            });
        },
        clearEvent(index?: number) {
            if (typeof index === 'undefined') {
                return builder().set('eventInfoList', []);
            }
            return builder().removeAt('eventInfoList', index);
        }
    }
};