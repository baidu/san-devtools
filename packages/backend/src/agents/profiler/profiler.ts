/**
 * @file
 */

// compiled 生命周期触发的时候能够获取到父组件的 id
// start 开始时间为触发的生命周期触发的最小值
import {
    getComponentName
} from '../../utils/sanHelper';
import {Component, DevToolsHook, ProfilerData} from '../../hook';

const PROFILER_EVENT_MAP: Record<string, string> = {
    'comp-beforeCompile': 'comp-compiled',
    'comp-beforeInit': 'comp-inited',
    'comp-beforeCreate': 'comp-created',
    'comp-beforeAttach': 'comp-attached',
    'comp-beforeDetach': 'comp-detached',
    'comp-beforeDispose': 'comp-disposed',
    'comp-beforeUpdate': 'comp-updated'
};

/**
 * 生成 profiler 信息，列表数据以及被选中组件的数据是实时更新的，其他组件的 profile 数据是按需加载的
 * @param {*} component 组件实例
 * @param {*} message 事件名称，比如'comp-compiled'
 */
export function addToProfilerData(hook: DevToolsHook<{}>, component: Component, lifeCycleHookName: string) {
    let done = false;
    let time = performance.now();
    let id = component.id + '';
    // 一个组件的 ptofile 数据，获取或者初始化
    let profilerData: ProfilerData = hook.profilerData.get(id) || {
        name: 'ComponentClass',
        id,
        parentId: '',
        hooks: {},
        start: 0,
        end: 0,
        totalTime: 0 // 总时间
    };

    // 更新开始时间
    if (profilerData.start === 0) {
        profilerData.start = time;
    }

    // 更新组件名称
    if (
        lifeCycleHookName !== 'comp-detached'
        && lifeCycleHookName !== 'comp-beforeDetach'
        && lifeCycleHookName !== 'comp-beforeDispose'
        && lifeCycleHookName !== 'comp-disposed'
    ) {
        let name = getComponentName(component);
        profilerData.name = name;
    }

    // 更新父组件 id
    profilerData.parentId = component.parentComponent ? component.parentComponent.id + '' : '';

    // 更新生命周期数据
    if (lifeCycleHookName.indexOf('before') > -1) {
        let type = PROFILER_EVENT_MAP[lifeCycleHookName]; // 后续生命周期
        // 一个组件中每个 hook 的数据，渲染次数与总时间
        let hookData = profilerData.hooks[type] || {
            count: 0,
            totalTime: 0,
            start: [],
            end: []
        };
        // 处理 before 的数据，更新 start time。
        let count = hookData.count;
        hookData.start[count] = time;
        hookData.end[count] = 0;
        profilerData.hooks[type] = hookData;
    }
    else {
        // 一个组件中每个 hook 的数据，渲染次数与总时间
        let hookData = profilerData.hooks[lifeCycleHookName] || {
            count: 0,
            totalTime: 0,
            start: [0],
            end: [0]
        };
        let count = hookData.count;
        hookData.end[count] = time;
        let duration = hookData.end[count] - hookData.start[count];
        hookData.count++;
        hookData.totalTime += duration;
        profilerData.totalTime += duration;
        profilerData.hooks[lifeCycleHookName] = hookData;
        done = true;
        if (profilerData.end < time) {
            profilerData.end = time;
        }
    }

    // 存储 profiler 的数据
    hook.profilerData.set(id, profilerData);

    // 如果某个生命周期钩子结束，则返回结果，否则返回空，有结果才会发送数据
    return done ? {
        name: profilerData.name,
        id: profilerData.id,
        parentId: profilerData.parentId,
        totalTime: profilerData.totalTime,
        start: profilerData.start,
        end: profilerData.end,
        hooks: {
            [lifeCycleHookName]: profilerData.hooks[lifeCycleHookName]
        }
    } : null;
}

/**
 * 将map数据序列化成数组
 * @param {*} profilerDataMap 数组数据
 */
export function generateProfilerDataList(profilerDataMap: Map<string, any>) {
    let list = [...profilerDataMap];
    return list.map(item => {
        if (!item[1]) {
            return null;
        }
        return item[1];
    }).filter(Boolean);
}
