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
    buildHistory,
    getHistoryInfo
} from './history';
import {
    inspectSanInstance,
    setupInspectInstance
} from './inspector';
import CircularJSON from '@shared/utils/circularJSON';

export class ComponentAgent extends Agent {
    onHookEvent(evtName: string, component: Component): void {
        switch (evtName) {
            case 'comp-compiled':
            case 'comp-inited':
            case 'comp-created':
            case 'comp-disposed':
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                } else {
                    buildHistory(this.hook, component, evtName);
                }
                return;
            // FIXME: 这里组件树挂载的时候由于从下往上挂载，因此会出现频繁 sendToFrontend
            case 'comp-attached': {
                // history
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                } else {
                    buildHistory(this.hook, component, evtName);
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
                } else {
                    buildHistory(this.hook, component, evtName);
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
        // TODO: 这里需要发送消息给Bridge，处理好old和new
        // this.sendToFrontend(evtName, component);
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
            if (message.loadBefore) {
                this.sendToFrontend('History.setHistory', JSON.stringify(this.hook.history));
            }
        });

        // 6. inspect
        setupInspectInstance(this.hook);
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new ComponentAgent(hook, bridge);
}
