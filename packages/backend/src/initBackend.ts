import Bridge from '@shared/Bridge';
import {DevToolsHook} from './hook';
import component from './agents/component/index';
import store from './agents/store/index';
import communication from './agents/communication/index';
import setupHighlighter from './highlighter';

function initHookData(hook: DevToolsHook<{}>) {
    hook.messageRecording = false;
    hook.eventRecording = false;
    hook.recording = false;
}

// const target: global = typeof navigator !== 'undefined' ? window : typeof global !== 'undefined' ? global : {};
// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function initBackend(hook: DevToolsHook<{}>, bridge: Bridge, global: any) {
    // 1. 初始化component
    component(hook, bridge);
    // 2. 初始化store
    store(hook, bridge);
    // 3. message 和 event
    communication(hook, bridge);
    // 4. 高亮
    hook.once('san', () => {
        setupHighlighter(hook, bridge, global);
    });
    // 5. 监听 frontend 是否已经准备就绪
    bridge.on('HandShake.frontendReady', () => {
        initHookData(hook);
        hook.devtoolReady = true;
        // 发送san版本
        // 这里放到ready里面，就是假如hook.san这时候事件没有接收到，san是空的，所以应该压入一个栈
        hook.ready((hook: DevToolsHook<{}>) => {
            bridge.send('San.setSanVersion', hook.san && hook.san.version);
        });
    });
}
