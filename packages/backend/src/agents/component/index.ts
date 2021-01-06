import Bridge from '@shared/Bridge';
import {SAN_COMPONENT_HOOK} from '../../constants';
import {DevToolsHook, ComponentTreeData, Component} from '../../hook';
import Agent from '../Agent';
import {
    addToTreeData,
    deleteFromTreeData,
    getComponentTree
} from './componentTree';
import {
    editComponentData,
    getComponentData
} from './componentData';
import {
    getHistoryInfo
} from './history';
import {
    addToProfilerData,
    generateProfilerDataList
} from './profiler';
import {
    inspectSanInstance,
    setupInspectInstance
} from './inspector';
import CircularJSON from '@shared/utils/circularJSON';
import {versionCompare} from '@shared/utils/versionCompare';

// 标记首屏数据是否完成
let firstRender = false;
// 标记是否在首屏完成之前请求过数据
let getFirstReanderProfilerData = false;

export class ComponentAgent extends Agent {
    onHookEvent(evtName: string, component: Component): void {
        if (versionCompare(this.hook.san.version, '3.10.1') >= 0) {
            // 存储 profiler 数据
            let profilerData = addToProfilerData(this.hook, component, evtName);
            // 首屏根据根组件挂载来判断
            if (evtName === 'comp-attached' && !component.parentComponent) {
                firstRender = true;
                if (getFirstReanderProfilerData) {
                    // 处理在组件还没挂载完成的之前获取首屏数据，这里重新发送一下
                    let firstRenderList = generateProfilerDataList(this.hook.profilerData);
                    this.sendToFrontend('Profiler.setFirstReanderProfilerData', JSON.stringify(firstRenderList));
                }
            }
            // 是否 profiler 面板在记录数据
            if (this.hook.profilerRecording) {
                if (profilerData) {
                    this.sendToFrontend('Profiler.setProfilerData', JSON.stringify(profilerData));
                }
                // 如果选中的组件的数组更新了，直接发送 info
                if (component.id + '' === this.hook.profilerComponentId) {
                    let profilerInfo = this.hook.profilerData.get(component.id + '');
                    this.sendToFrontend('Profiler.setProfilerInfo', JSON.stringify(profilerInfo));
                }
            }
        }

        // 处理其他的 backend 模块
        switch (evtName) {
            case 'comp-compiled':
            case 'comp-inited':
            case 'comp-created':
            case 'comp-disposed':
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                }
                return;
            // FIXME: 这里组件树挂载的时候由于从下往上挂载，因此会出现频繁 sendToFrontend
            case 'comp-attached': {
                // history
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                }
                // component
                this.hook.componentMap.set(String(component.id), component);
                this.hook.data.totalCompNums = this.hook.data.totalCompNums + 1;
                const data: ComponentTreeData = getComponentTree(this.hook, component);
                // inspector，更新 dom 上的 idPath
                inspectSanInstance(component, data.idPath);
                addToTreeData(this.hook.data.treeData, data);
                this.sendToFrontend('Component.setTreeData', JSON.stringify(this.hook.data));
                break;
            }
            // FIXME: 这里组件树卸载的时候由于从下往上卸载，因此会出现频繁 sendToFrontend
            case 'comp-detached': {
                // history
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                }
                // component
                this.hook.componentMap.delete(String(component.id));
                this.hook.data.totalCompNums = this.hook.data.totalCompNums - 1;
                const data: ComponentTreeData = getComponentTree(this.hook, component);
                // inspector，更新 dom 上的 idPath
                inspectSanInstance(component, data.idPath);
                deleteFromTreeData(this.hook.data.treeData, data);
                this.sendToFrontend('Component.setTreeData', JSON.stringify(this.hook.data));
                break;
            }
            case 'comp-updated': {
                // 发送更新的组件信息
                this.hook.componentMap.set(component.id + '', component);
                if (this.hook.data && this.hook.data.selectedComponentId === component.id + '') {
                    // eslint-disable-next-line
                    this.sendToFrontend('Component.setComponentInfo', CircularJSON.stringify(getComponentData(component)));
                }
                break;
            }
            default: break;
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
    /* eslint-disable  @typescript-eslint/no-empty-function */
    addListener() {
        this.bridge.on('Component.getTreeData', () => {
            this.sendToFrontend('Component.setTreeData', JSON.stringify(this.hook.data));
        });

        // 监听组件信息获取信号，并返回结果
        this.bridge.on('Component.getComponentInfo', id => {
            let component = this.hook.componentMap.get(String(id));
            if (!component) {
                return;
            }
            let data = getComponentData(component);
            this.sendToFrontend('Component.setComponentInfo', CircularJSON.stringify(data));
            this.hook.data.selectedComponentId = id;
        });

        // 接收修改组件 data 信号，修改组件 data
        this.bridge.on('Component.modifyComponentData', message => {
            editComponentData(this.hook, message);
        });

        // history
        this.bridge.on('History.historyRecording', message => {
            this.hook.recording = message.recording;
        });

        // 6. inspect
        setupInspectInstance(this.hook);

        // profiler
        this.bridge.on('Profiler.getProfilerInfo', profilerComponentId => {
            this.hook.profilerComponentId = profilerComponentId + '';
            if (!profilerComponentId) {
                return;
            }
            let profilerInfo = this.hook.profilerData.get(profilerComponentId + '');
            this.sendToFrontend('Profiler.setProfilerInfo', JSON.stringify(profilerInfo));
        });

        this.bridge.on('Profiler.profilerRecording', message => {
            this.hook.profilerRecording = message.recording;
        });

        this.bridge.on('Profiler.getFirstReanderProfilerData', () => {
            if (firstRender) {
                getFirstReanderProfilerData = false;
                let firstRenderList = generateProfilerDataList(this.hook.profilerData);
                this.sendToFrontend('Profiler.setFirstReanderProfilerData', JSON.stringify(firstRenderList));
            }
            else {
                getFirstReanderProfilerData = true;
            }
        });
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new ComponentAgent(hook, bridge);
}
