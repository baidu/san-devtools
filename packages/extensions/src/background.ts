/* global __DEBUG__ chrome */
import {portManager} from '../utils/portManager';
import {relay} from './contentScript/relay';
let localStorage = window.localStorage;
type Port = chrome.runtime.Port;
interface Ports {[key: string]: Port}
const SAN_DEVTOOLS_PANEL = 'san-devtools-panel';
const CONTENT_SCRIPT = 'content-script';
portManager.onDisconnect = (memberName: string, ports: Ports, listener: Function) => {
    Object.entries(ports).forEach((member: [string, any]) => {
        if (
            memberName === SAN_DEVTOOLS_PANEL
            && member[1]
            || memberName === CONTENT_SCRIPT
            && member[1]
            && memberName === member[0]
        ) {
            // 接触绑定，删除 port
            member[1].onMessage.removeListener(listener);
            member[1].disconnect();
            delete ports[member[0]];
        }
    });
};
// 1. 收集所有的 port， port 负责传输 devtool 面板所需要的数据
chrome.runtime.onConnect.addListener(function (port: chrome.runtime.Port) {
    if (__DEBUG__) {
        console.log('connected with san-devtools background', port);
    }
    let tabId: string;
    let memberName: string;
    if (+port.name + '' === port.name) {
        tabId = port.name;
        memberName = SAN_DEVTOOLS_PANEL;
    } else if (port.sender && port.sender.tab) {
        tabId = port.sender.tab.id + '';
        memberName = port.name;
    } else {
        return;
    }
    portManager.addPort(port, tabId, memberName, (existed: boolean) => {
        if (memberName === SAN_DEVTOOLS_PANEL) {
            updateContextMenus(+tabId);
            if (!existed) {
                // 排除第一次点击 panel 的时候，因为 san 页面加载的时候已经加载了 relay，后续关闭 panel 都会删除这个 port
                let code = `(${relay.toString()})()`;
                chrome.tabs.executeScript(
                    +tabId,
                    {
                        code
                    },
                    function (res) {
                        if (!res) {
                            // TODO：通知 frontend
                            if (__DEBUG__) {
                                // eslint-disable-next-line
                                console.log('failed to establish a connection between content_script and background' + tabId);
                            }
                        } else {
                            if (__DEBUG__) {
                                // eslint-disable-next-line
                                console.log('success to establish a connection between content_script and background' + tabId);
                            }
                            // 当 content_script 建立链接之后，通知 frontend
                            port.postMessage([
                                {
                                    event: 'SYSTEM:backendConnected',
                                    payload: ''
                                }
                            ]);
                        }
                    }
                );
            }
        }
    });
});
const SETTINGS_SET = 'Setting.set';
const SETTINGS_GET = 'Setting.get';
// 2. 监听其他 part 过来的消息：主要用于版本信息的传递
chrome.runtime.onMessage.addListener((req, sender, sendResponse) => {
    let event = req.event;
    switch (event) {
        case SETTINGS_SET: {
            // eslint-disable-next-line
            req.settingData && (localStorage['settingData'] = JSON.stringify(req.settingData));
            return;
        }
        case SETTINGS_GET: {
            // eslint-disable-next-line
            sendResponse(localStorage['settingData']);
            return;
        }
        default:
            break;
    }
    if (!req || !sender || !sender.tab) {
        return;
    }
    let data = {
        version: req.version,
        tabId: sender.tab.id || -1
    };
    updateBrowserAction(data);
});
/**
 * 找到需要设置菜单栏图标的tabid
 * @param {*} ver
 * @param {*} from
 */
interface BackendReadyData {
    version: string;
    tabId: number;
}
function updateBrowserAction(data: BackendReadyData) {
    let {version, tabId} = data;
    if (typeof version === 'undefined') {
        return;
    }
    if (tabId) {
        updateBadgeTextAndIcon(+tabId, version);
    }
}
/**
 * 设置菜单栏图标文字以及背景图片
 * @param {*} tabId
 * @param {*} version
 */
function updateBadgeTextAndIcon(tabId: number, version: string) {
    // 设置chrome上的菜单栏图标
    chrome.browserAction.setIcon({
        tabId,
        path: {
            16: 'icons/logo16.png',
            48: 'icons/logo48.png',
            128: 'icons/logo128.png'
        }
    });
    chrome.browserAction.setPopup({
        tabId: tabId,
        popup: `popup.html?version=${version}`
    });
}
// 切换 tab，先移除 contextMenus，如果存在 port 则创建新的
chrome.tabs.onActivated.addListener(({tabId}) => {
    updateContextMenus(tabId);
});
function updateContextMenus(tabId: number) {
    chrome.contextMenus.removeAll(() => {
        if (portManager.getPortFromRoom(tabId + '', SAN_DEVTOOLS_PANEL)) {
            chrome.contextMenus.create({
                id: 'san-inspect-instance',
                title: 'Inspect san component',
                contexts: ['all']
            });
        }
    });
}
chrome.contextMenus.onClicked.addListener((info, tab) => {
    if (tab && tab.active && tab.id && info && info.menuItemId) {
        let id = tab.id + '';
        let targetPort = portManager.getPortFromRoom(id, SAN_DEVTOOLS_PANEL);
        targetPort && targetPort.postMessage('Inspector.component');
    }
});