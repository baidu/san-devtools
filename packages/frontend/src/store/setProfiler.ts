/**
 * @file
 */
import {builder} from 'san-update';

interface ProfilerData {
    name: string; // 组件名称
    id: string; // 组件 id
    hooks: Record<string, HookData>; // 组件的生命周期钩子函数的数据
    totalTime: number; // 组件渲染的总时间
    parentId: string;
}

interface HookData {
    count: number; // 执行次数
    totalTime: number; // 执行的总时长
    start: number[]; // 开始时间，before* 触发的时刻
    end: number[]; // 结束时间，*ed 结束的时刻
}

export const setProfilerData = {
    initData: {
        profilerDataStore: {},
        profilerInfo: {},
        profilerTime: ['firstRender'],
        currentTime: 'firstRender'
    },
    actions: {
        setProfilerData(profilerData: ProfilerData, {getState}: any) {
            let currentTime = getState('currentTime') + '';
            currentTime = currentTime.replace(/[\s-:]/gi, '');
            let oldValue = getState(`profilerDataStore['${currentTime}']['${profilerData.id}']`);
            // 以前没有数据，直接存储
            if (!oldValue || !profilerData) {
                return builder().set(`profilerDataStore['${currentTime}']['${profilerData.id}']`, profilerData);
            }
            // 有数据，将数据更新并更新 hooks
            let hooks = Object.assign({}, oldValue.hooks, profilerData.hooks);
            let newValue = {
                name: profilerData.name,
                id: profilerData.id,
                parentId: profilerData.parentId,
                totalTime: profilerData.totalTime,
                hooks
            };
            return builder().set(`profilerDataStore['${currentTime}']['${profilerData.id}']`, newValue);
        },
        setProfilerInfo(profilerInfo: ProfilerData) {
            return builder().set('profilerInfo', profilerInfo);
        },
        setProfilerDataList(profilerDataList: any[]) {
            let newProfilerDataStore: Record<string, any> = {};
            profilerDataList.map(item => {
                newProfilerDataStore[`${item.id}`] = item;
            });
            return builder().set('profilerDataStore["firstRender"]', newProfilerDataStore);
        },
        addProfilerTime(time: string) {
            return builder().apply('profilerTime', (oldValue: string[]) => {
                let newValue = oldValue.slice();
                newValue.push(time);
                return newValue;
            });
        },
        setCurrentTime(time: string) {
            return builder()
                .set('currentTime', time)
                .set('profilerInfo', {});
        },
        beginRecord(date: string, {dispatch}: any) {
            // 保存之前的数据到对象中
            // 将时间设置到数组中
            dispatch('addProfilerTime', date);
            dispatch('setCurrentTime', date);
        }
    }
};
