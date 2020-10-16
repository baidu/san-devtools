import Bridge from '@shared/Bridge';
import FrontendReceiver from './message';
export function initFrontend(bridge: Bridge) {
    // bridge.on 接收消息
    new FrontendReceiver(bridge);
    // 握手
    bridge.send('HandShake.frontendReady', 'I am FrontEnd, I am standby!');
}
