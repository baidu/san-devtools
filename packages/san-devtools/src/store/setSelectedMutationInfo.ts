/**
 * @file
 */
import {builder} from 'san-update';

interface SelectedMutationInfo{
    storeName: string;
    actionName: string;
    timeRange: string;
    status: string;
    actionId: string;
    parentActionId: string;
    childsId: string[];
    payload: any;
    diff: any;
}

export const setSelectedMutationInfo = {
    initData: {
        selectedMutationInfo: null,
        selectedMutationName: '',
        selectedStoreName: ''
    },
    actions: {
        setSelectedMutationInfo(selectedMutationInfo: SelectedMutationInfo) {
            return builder()
                .set('selectedMutationInfo', selectedMutationInfo)
                .set('selectedMutationName', selectedMutationInfo.actionName)
                .set('selectedStoreName', selectedMutationInfo.storeName);
        }
    }
};
