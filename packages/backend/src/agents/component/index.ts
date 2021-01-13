import Bridge from '@shared/Bridge';
import {SAN_COMPONENT_HOOK} from '../../constants';
import {DevToolsHook, ComponentTreeData, Component} from '../../hook';
import Agent from '../Agent';
import {
    getAllComponentTree,
    getComponentTree
} from './componentTree';
import {
    getComponentPath
} from '../../utils/sanHelper';
import {
    editComponentData,
    getComponentData
} from './componentData';
import {
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
                }
                return;
            case 'comp-attached': {
                // history
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                }
                // component
                this.hook.componentMap.set(String(component.id), component);
                this.hook.data.totalCompNums = this.hook.data.totalCompNums + 1;
                const data: ComponentTreeData = getComponentTree(this.hook, component);
                this.hook.data.treeData.set(String(component.id), data);
                // inspector，更新 dom 上的 idPath
                inspectSanInstance(component, data.idPath);
                this.sendToFrontend('Component.setTreeData', JSON.stringify({type: 'add', data}));
                break;
            }
            case 'comp-detached': {
                // history
                if (this.hook.recording) {
                    this.sendToFrontend('History.setHistory', getHistoryInfo(component, evtName));
                }
                // component
                this.hook.componentMap.delete(String(component.id));
                this.hook.data.treeData.delete(String(component.id));
                this.hook.data.totalCompNums = this.hook.data.totalCompNums - 1;
                // 删除只需要 idPath 即可
                const data: {idPath: string[]} = {
                    idPath: getComponentPath(component)
                };
                this.sendToFrontend('Component.setTreeData', JSON.stringify({type: 'del', data}));
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
            let treeData = getAllComponentTree(this.hook);
            this.sendToFrontend('Component.setTreeData', JSON.stringify(treeData));
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
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new ComponentAgent(hook, bridge);
}
