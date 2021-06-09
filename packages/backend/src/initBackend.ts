import Bridge from '@shared/Bridge';
import {HANDSHAKE_FRONTEND_READY, SAN_SET_VERSION} from '@shared/protocol';
import {DevToolsHook} from './hook';
import {getAgents, AgentCreator} from './agentController';
import setupHighlighter from './highlighter';

function initHookData(hook: DevToolsHook<{}>) {
    hook.messageRecording = false;
    hook.eventRecording = false;
    hook.recording = false;
    hook.profilerRecording = false;
}

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export default function initBackend(hook: DevToolsHook<{}>, bridge: Bridge, global: any) {
    // san 注册成功之后，组件视实例化之前注册对应的 agent
    hook.on('san', san => {
        let agents = getAgents(san.version);
        agents.forEach((agent: AgentCreator | null) => {
            if (typeof agent === 'function') {
                // 根据 san.version 注册对应的 agent
                agent(hook, bridge);
            }
        });
        // 高亮
        setupHighlighter(hook, bridge, global);
    });
    // 监听 frontend 是否已经准备就绪
    bridge.on(HANDSHAKE_FRONTEND_READY, () => {
        initHookData(hook);
        hook.devtoolReady = true;
        // 发送san版本
        // 这里放到ready里面，就是假如hook.san这时候事件没有接收到，san是空的，所以应该压入一个栈
        hook.ready((hook: DevToolsHook<{}>) => {
            bridge.send(SAN_SET_VERSION, hook.san && hook.san.version);
        });
    });
}
