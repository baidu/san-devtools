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
        historyRecordings: [],
        historyLengthBeforeDevtoolCreated: 0
    },
    actions: {
        setHistory(history: string[] | HistoryData, {dispatch}: any) {
            if (!Array.isArray(history)) {
                return builder().apply('historyRecordings', (oldValue: HistoryData[]) => {
                    let arr = oldValue.slice();
                    arr.unshift(history);
                    return arr;
                });
            } else {
                dispatch('setHistoryLengthBeforeDevtoolCreated', history.length);
                return builder().apply('historyRecordings', (oldValue: any) => {
                    let historyBefore = history
                        .map(item => {
                            let data;
                            try {
                                data = JSON.parse(item);
                            } catch (e) {
                                // data = item;
                                console.warn('[SAN_DEVTOOLS]:JSON.parse error', item);
                            }
                            return data;
                        })
                        .filter(Boolean);
                    return oldValue.slice().concat(historyBefore);
                });
            }
        },
        setHistoryLengthBeforeDevtoolCreated(len: number) {
            return builder().set('historyLengthBeforeDevtoolCreated', len);
        },
        clearHistory(index?: number) {
            if (typeof index === 'undefined') {
                return builder().set('historyRecordings', []);
            }
            return builder().removeAt('historyRecordings', index);
        }
    }
};
