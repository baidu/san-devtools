/* global __DEBUG__ */
import {portManager} from '../utils/portManager';
import {relay} from './contentScript/relay';

let localStorage = window.localStorage;

// 1. 收集所有的 port， port 负责传输 devtool 面板所需要的数据
chrome.runtime.onConnect.addListener(function (port: chrome.runtime.Port) {
    if (__DEBUG__) {
        console.log(port);
    }
    portManager.addPort(port, (tabId: number, memberName: string, existed: boolean) => {
        if (memberName === 'san-devtools-panel') {
            updateContextMenus(tabId);
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
            localStorage['settingData'] = JSON.stringify(req.settingData);
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
        visibility: req.visibility,
        tabId: sender.tab.id || -1
    };
    updateBrowserAction(data);
});
/**
 * 找到需要设置菜单栏图标的tabid
 * @param {*} ver
 * @param {*} visibility
 * @param {*} from
 */
interface BackendReadyData {
    version: string;
    visibility: boolean;
    tabId: number;
}
function updateBrowserAction(data: BackendReadyData) {
    let {version, visibility, tabId} = data;
    if (typeof version === 'undefined') {
        return;
    }
    if (tabId) {
        updateBadgeTextAndIcon(+tabId, version, visibility);
    }
}

/**
 * 设置菜单栏图标文字以及背景图片
 * @param {*} tabId
 * @param {*} ver
 * @param {*} visibility
 */
function updateBadgeTextAndIcon(tabId: number, version: string, visibility: boolean) {
    // 设置chrome上的菜单栏图标san版本号
    chrome.browserAction.setBadgeText({
        tabId,
        text: visibility && !+localStorage.do_not_show_version ? version : ''
    });
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
        if (portManager.getPortFromRoom(tabId + '', 'san-devtools-panel')) {
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
        let targetPort = portManager.getPortFromRoom(id, 'san-devtools-panel');
        targetPort && targetPort.postMessage('Inspector.component');
    }
});
