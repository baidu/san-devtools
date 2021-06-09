import Bridge from '@shared/Bridge';
import {
    MESSAGE_SET_INFO,
    EVENT_SET_INFO,
    MESSAGE_RECORD,
    MESSAGE_DISPATCH,
    EVENT_RECORD,
    EVENT_FIRE
} from '@shared/protocol';
import {SAN_MESSAGE_HOOK, SAN_EVENT_HOOK} from '../../constants';
import {DevToolsHook} from '../../hook';
import Agent from '../Agent';
import {getMessageInfo, getEventInfo} from './communication';

export class CommunicationAgent extends Agent {
    onHookEvent(evtName: string, data: any): void {
        switch (evtName) {
            case 'comp-message': {
                if (this.hook.messageRecording) {
                    this.sendToFrontend(MESSAGE_SET_INFO, getMessageInfo(data));
                }
                break;
            }
            case 'comp-event': {
                if (this.hook.eventRecording) {
                    this.sendToFrontend(EVENT_SET_INFO, getEventInfo(data));
                }
                break;
            }
            default:
                break;
        }
    }

    setupHook() {
        // 生命周期监听
        [...SAN_EVENT_HOOK, ...SAN_MESSAGE_HOOK].map(evtName => {
            this.hook.on(evtName, data => {
                if (!data) {
                    return;
                }
                this.onHookEvent(evtName, data);
            });
        });
    }
    /* eslint-disable  @typescript-eslint/no-empty-function */
    addListener() {
        this.bridge.on(MESSAGE_RECORD, message => {
            this.hook.messageRecording = message.recording;
        });
        this.bridge.on(MESSAGE_DISPATCH, data => {
            let {componentId, payload, eventName} = data;
            let component = this.hook.componentMap.get(componentId + '');
            component && component.dispatch(eventName, payload);
        });
        this.bridge.on(EVENT_RECORD, message => {
            this.hook.eventRecording = message.recording;
        });
        this.bridge.on(EVENT_FIRE, data => {
            let {componentId, payload, eventName} = data;
            let component = this.hook.componentMap.get(componentId + '');
            component && component.fire(eventName, payload);
        });
    }
}

export default function init(hook: DevToolsHook<any>, bridge: Bridge) {
    return new CommunicationAgent(hook, bridge);
}
