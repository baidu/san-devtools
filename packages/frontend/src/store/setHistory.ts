/**
 * @file
 */
import {builder} from 'san-update';

interface HistoryData{
    key: number;
    component: {
        componentName: string;
        id: string;
    };
    time: string;
    payload: any;
    event: string;
}

export const setHistory = {
    initData: {
        historyRecordings: []
    },
    actions: {
        setHistory(history: HistoryData) {
            return builder().apply('historyRecordings', (oldValue: HistoryData[]) => {
                let arr = oldValue.slice();
                arr.unshift(history);
                return arr;
            });
        },
        clearHistory(index?: number) {
            if (typeof index === 'undefined') {
                return builder().set('historyRecordings', []);
            }
            return builder().removeAt('historyRecordings', index);
        }
    }
};
