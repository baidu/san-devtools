import Bridge from '@shared/Bridge';
import {DevToolsHook} from '../hook';

export default class Agent {
    hook: DevToolsHook<any>;
    bridge: Bridge;

    constructor(hook: DevToolsHook<any>, bridge: Bridge) {
        this.hook = hook;
        this.bridge = bridge;
        this.setupHook();
        this.addListener();
    }
    sendToFrontend(evtName: string, data: any) {
        if (this.hook.devtoolReady) {
            this.bridge.send(evtName, data);
        }
    }
    /* eslint-disable  @typescript-eslint/no-empty-function */
    addListener() {}
    setupHook() {}
}
