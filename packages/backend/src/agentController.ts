/**
 * @file 按照 san version 获取对应的 agent
 */
import {versionCompare} from '@shared/utils/versionCompare';
import Bridge from '@shared/Bridge';
import {DevToolsHook} from './hook';

import profiler from './agents/profiler/index';
import component from './agents/component/index';
import store from './agents/store/index';
import communication from './agents/communication/index';

export type AgentCreator = (hook: DevToolsHook<any>, bridge: Bridge) => void;

interface AgentInfo {
    name: string;
    agent: AgentCreator;
    sanVersion: string;
}

const originAgents: AgentInfo[] = [
    {
        name: 'communication',
        agent: communication,
        sanVersion: '3.9.4'
    },
    {
        name: 'component',
        agent: component,
        sanVersion: '0.0.0'
    },
    {
        name: 'store',
        agent: store,
        sanVersion: '0.0.0'
    },
    {
        name: 'profiler',
        agent: profiler,
        sanVersion: '3.10.1'
    }
];

export function getAgents(version: string) {
    return originAgents.map((agnetInfo: AgentInfo) => {
        return versionCompare(version, agnetInfo.sanVersion) >= 0 ? agnetInfo.agent : null;
    }).filter(Boolean);
}
