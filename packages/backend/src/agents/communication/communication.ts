import {
    getComponentName,
} from '../../utils/sanHelper';
import {
    toLocaleDatetime
} from '@shared/utils/dateFormator';
import CircularJSON from '@shared/utils/circularJSON';
import {Component} from '../../hook';

let eGuidIndex = 0;
let mGuidIndex = 0;

interface MessageData {
    receiver: Component;
    target: Component;
    value: any;
    name: string;
}

interface EventData {
    event: any;
    target: Component;
    name: string;
}

function getMessageInfo(data: MessageData): string {
    let time = toLocaleDatetime(new Date(), 'hh:mm:ss');
    let {
        target: sender,
        receiver,
        value: payload,
        name: event
    } = data;
    let senderComponentName = getComponentName(sender);
    let receiverComponentName = getComponentName(receiver);
    return CircularJSON.stringify({
        key: ++mGuidIndex,
        time,
        event,
        sender: {
            id: sender.id,
            componentName: senderComponentName
        },
        receiver: {
            id: receiver.id,
            componentName: receiverComponentName
        },
        payload,
    });
}

function getEventInfo(data: EventData): string {
    let time = toLocaleDatetime(new Date(), 'hh:mm:ss');
    let {
        target,
        name,
        event: payload
    } = data;
    let fireComponentName = getComponentName(target);
    return CircularJSON.stringify({
        key: ++eGuidIndex,
        time,
        payload,
        event: name,
        component: {
            id: target.id,
            componentName: fireComponentName
        }
    });
}

export {
    getMessageInfo,
    getEventInfo
};