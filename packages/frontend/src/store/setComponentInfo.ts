/**
 * @file
 */
import {builder} from 'san-update';

interface ComponentData {
    data: any;
    messages: Array<{
        name: string;
        fn: string;
    }>;
    filters: Array<{
        name: string;
        fn: string;
    }>;
    computed: Array<{
        computedName: string;
        deps: Array<{key: string, value: any}>;
        fn: string;
    }>;
}

export const setComponentInfo = {
    initData: {
        componentInfo: null
    },
    actions: {
        setComponentInfo(componentInfo: ComponentData) {
            return builder().set('componentInfo', componentInfo);
        }
    }
};