import Bridge from '@shared/Bridge';
import {
    PROFILER_SET_DATA,
    PROFILER_SET_INFO,
    PROFILER_GET_INFO,
    PROFILER_SET_FIRST_RENDER_DATA,
    PROFILER_GET_FIRST_RENDER_DATA,
    PROFILER_RECORD
} from '@shared/protocol';
import {SAN_COMPONENT_HOOK} from '../../constants';
import {DevToolsHook, Component} from '../../hook';
import Agent from '../Agent';
import {
    addToProfilerData,
    generateProfilerDataList
} from './profiler';

// 标记首屏数据是否完成
let firstRender = false;
// 标记是否在首屏完成之前请求过数据
let getFirstReanderProfilerData = false;

export class ProfilerAgent extends Agent {
    onHookEvent(evtName: string, component: Component): void {
        // 存储 profiler 数据
        let profilerData = addToProfilerData(this.hook, component, evtName);
        // 首屏根据根组件挂载来判断
        if (evtName === 'comp-attached' && !component.parentComponent) {
            firstRender = true;
            if (getFirstReanderProfilerData) {
                // 处理在组件还没挂载完成的之前获取首屏数据，这里重新发送一下
                let firstRenderList = generateProfilerDataList(this.hook.profilerData);
                this.sendToFrontend(PROFILER_SET_FIRST_RENDER_DATA, JSON.stringify(firstRenderList));
            }
        }
        // 是否 profiler 面板在记录数据
        if (this.hook.profilerRecording) {
            if (profilerData) {
                this.sendToFrontend(PROFILER_SET_DATA, JSON.stringify(profilerData));
            }
            // 如果选中的组件的数组更新了，直接发送 info
            if (component.id + '' === this.hook.profilerComponentId) {
                let profilerInfo = this.hook.profilerData.get(component.id + '');
                this.sendToFrontend(PROFILER_SET_INFO, JSON.stringify(profilerInfo));
            }
        }
    }

    setupHook() {
        // 生命周期监听
        SAN_COMPONENT_HOOK.map(evtName => {
            this.hook.on(evtName, component => {
                if (!component || !component.id) {
                    return;
                }
                this.onHookEvent(evtName, component);
            });
        });
    }

    addListener() {
        this.bridge.on(PROFILER_GET_INFO, profilerComponentId => {
            this.hook.profilerComponentId = profilerComponentId + '';
            if (!profilerComponentId) {
                return;
            }
            let profilerInfo = this.hook.profilerData.get(profilerComponentId + '');
            this.sendToFrontend(PROFILER_SET_INFO, JSON.stringify(profilerInfo));
        });

        this.bridge.on(PROFILER_RECORD, message => {
            this.hook.profilerRecording = message.recording;
        });

        this.bridge.on(PROFILER_GET_FIRST_RENDER_DATA, () => {
            if (firstRender) {
                getFirstReanderProfilerData = false;
                let firstRenderList = generateProfilerDataList(this.hook.profilerData);
                this.sendToFrontend(PROFILER_SET_FIRST_RENDER_DATA, JSON.stringify(firstRenderList));
            }
            else {
                getFirstReanderProfilerData = true;
            }
        });
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new ProfilerAgent(hook, bridge);
}
