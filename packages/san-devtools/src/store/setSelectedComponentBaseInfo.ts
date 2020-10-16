/**
 * @file
 */
import {builder} from 'san-update';

interface ComponentBaseInfo{
    id: string;
    parentId: string;
    ownerId: string;
    tagName: string;
    displayName: string;
    idPath: string[];
}

export const setSelectedComponentBaseInfo = {
    initData: {
        selectedComponentBaseInfo: null
    },
    actions: {
        setSelectedComponentBaseInfo(selectedComponentBaseInfo: ComponentBaseInfo) {
            return builder().set('selectedComponentBaseInfo', selectedComponentBaseInfo);
        }
    }
};