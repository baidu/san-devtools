import {
    getComponentName
} from '../../utils/sanHelper';
import {
    toLocaleDatetime
} from '@shared/utils/dateFormator';
import {Component} from '../../hook';
import CircularJSON from '@shared/utils/circularJSON';

let guidIndex = 0;

/**
 * 生成历史记录信息。
 * @param {*} component 组件实例
 * @param {*} message 事件名称，比如'comp-compiled'
 */
export function getHistoryInfo(component: Component, lifeCycleHookName: string) {
    return CircularJSON.stringify({
        key: ++guidIndex,
        component: {
            componentName: getComponentName(component),
            id: component.id
        },
        time: toLocaleDatetime(new Date(), 'hh:mm:ss'),
        payload: component.data && component.data.raw || null,
        event: lifeCycleHookName.substring(5)
    });
}
