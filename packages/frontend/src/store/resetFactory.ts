import {Store} from 'san-store';
import {builder} from 'san-update';
export {connect as sanConnect} from 'san-store';

export interface StoreItem{
    initData: Record<string, any>;
    actions: {
        [key: string]: (storeData: any, context?: any) => any;
    };
}
const prefix = 'reset_';
export function actionCreator(actionOptions: StoreItem) {
    let {initData, actions} = actionOptions;
    let resetActions: Record<string, any> = {};
    Object.entries(initData).forEach(([key, val]) => {
        if (Array.isArray(initData[key])) {
            val = val.slice();
        }
        resetActions[`${prefix}${key}`] = function () {
            return builder().set(key, val);
        };
    });
    return {
        initData,
        actions: Object.assign({}, actions, resetActions)
    };
}

interface IOptions{
    includes?: string[];
    excludes?: string[];
}
export class EnhancedStore extends Store {
    '$resetStore'({includes = [], excludes = []}: IOptions) {
        if (includes.length === 0) {
            includes = Object.keys(this.raw);
        }
        includes.forEach(actionName => {
            if (excludes.indexOf(actionName) < 0) {
                try {
                    this.dispatch(`${prefix}${actionName}`, '');
                } catch (e) {
                    console.error('[SAN DEVTOOLS]: dispatch reset* failed', e);
                }
            }
        });
    }
}