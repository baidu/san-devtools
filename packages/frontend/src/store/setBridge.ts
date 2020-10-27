/**
 * @file
 */
import {builder} from 'san-update';
import Bridge from '@shared/Bridge';

export const bridge = {
    initData: {
        bridge: null
    },
    actions: {
        setBridge(bridge: Bridge) {
            return builder().set('bridge', bridge);
        }
    }
};
