/* global __DEBUG__ */
/**
 * @file handle ports
 */
type Port = chrome.runtime.Port;
interface Ports {[key: string]: Port}
class PortManager {
    _ports: any;
    onMessage: Function;
    onDisconnect: Function;
    constructor() {
        this._ports = {};
        this.onMessage = this._defaultOnMessage;
        this.onDisconnect = this._defaultOnDisconnect;
    }
    /**
     * 默认广播
     * @param message
     * @param memberName
     * @param ports
     */
    _defaultOnMessage(message: any, memberName: string, ports: Ports) {
        Object.entries(ports).forEach((member: [string, any]) => {
            if (member[0] !== memberName && member[1]) {
                if (__DEBUG__) {
                    console.log(`${memberName} -----> ${member[0]}`, message, member[1]);
                }
                member[1].postMessage(message);
            }
        });
    }
    /**
     * 断开链接
     * @param memberName
     * @param ports
     * @param listener
     */
    _defaultOnDisconnect(memberName: string, ports: Ports, listener: Function) {
        Object.entries(ports).forEach((member: [string, any]) => {
            if (member[0] !== memberName && member[1]) {
                // 接触绑定，删除 port
                member[1].onMessage.removeListener(listener);
                member[1].disconnect();
                delete ports[member[0]];
            }
        });
    }
    /**
     * 当接收到数据的时候/端开链接，发送给其他成员
     * @param {*} tabId
     * @param {*} memberName 某个成员
     * @param {*} port
     */
    _broadCastForPort(tabId: string, memberName: string, port: Port) {
        if (!port) {
            return;
        }
        let ports: any = this._ports[tabId];
        // eslint-disable-next-line
        let self = this;
        // 监听，广播消息
        function sendMessage(message: any) {
            if (typeof self.onMessage === 'function') {
                self.onMessage(message, memberName, ports);
            }
        }
        port.onMessage.addListener(sendMessage);
        // 断开链接
        function shutdown() {
            if (typeof self.onMessage === 'function') {
                self.onDisconnect(memberName, ports, sendMessage);
            }
        }
        port.onDisconnect.addListener(shutdown);
    }
    /**
     * 删除房间
     * @param {*} tabId
     */
    removePortByTabId(tabId: string) {
        delete this._ports[tabId];
    }
    /**
     * 将当前port添加到对应的房间/或者新开房间，并绑定事件
     * @param {*} port 端口对象
     * @param {*} tabId 房间号码
     * @param {*} memberName 某个成员
     * @param {*} cb 添加成功之后的回调
     */
    addPort(port: Port, tabId: string, memberName: string, cb: Function) {
        let existedPort = false;
        if (!this._ports[tabId]) {
            this._ports[tabId] = {
                [memberName]: port
            };
        } else {
            if (this._ports[tabId][memberName]) {
                existedPort = true;
                this._ports[tabId][memberName].disconnect();
            }
            this._ports[tabId][memberName] = port;
        }
        this._broadCastForPort(tabId, memberName, port);
        cb(existedPort);
        return port;
    }
    /**
     * 获取某个 member port
     * @param {*} tabId
     * @param {*} memberName
     */
    getPortFromRoom(tabId: string, memberName: string) {
        return this._ports[tabId] ? this._ports[tabId][memberName] : null;
    }
}
const portManager = new PortManager();
export {portManager};
