import Bridge from '@shared/Bridge';
import FrontendReceiver from './message';
export function initFrontend(bridge: Bridge) {
    new FrontendReceiver(bridge);
}
