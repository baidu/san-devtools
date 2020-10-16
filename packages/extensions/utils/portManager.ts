/* global __DEBUG__ */
/**
 * @file handle ports
 */
class PortManager {
    _ports: any;
    _messageIntercept: Function;
    constructor() {
        this._ports = {};
        // eslint-disable-next-line
        this._messageIntercept = (m: any) => true;
    }
    /**
     * 当接收到数据的时候/端开链接，发送给其他成员
     * @param {*} tabId
     * @param {*} memberName 某个成员
     * @param {*} port
     */
    _broadCastForPort(tabId: string, memberName: string, port: any) {
        if (!port) {
            return;
        }
        let ports: any = this._ports[tabId];
        // eslint-disable-next-line
        let self = this;
        // 监听，广播消息
        function sendMessage(message: any) {
            if (self._messageIntercept(message, memberName)) {
                Object.entries(ports).forEach((member: [string, any]) => {
                    if (member[0] !== memberName && member[1]) {
                        if (__DEBUG__) {
                            console.log(`${memberName} -----> ${member[0]}`, message, member[1]);
                        }
                        member[1].postMessage(message);
                    }
                });
            }
        }
        port.onMessage.addListener(sendMessage);
        // 断开链接
        function shutdown() {
            Object.entries(ports).forEach((member: [string, any]) => {
                if (
                    memberName === 'san-devtools-panel'
                    && member[1]
                    || memberName === 'content-script'
                    && member[1]
                    && memberName === member[0]
                ) {
                    // 接触绑定，删除 port
                    member[1].onMessage.removeListener(sendMessage);
                    member[1].disconnect();
                    delete ports[member[0]];
                }
            });
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
     * @param {*} tabId 房间号码
     * @param {*} memberName 某个成员
     * @param {*} port
     */
    addPort(port: any, fn: Function) {
        let tabId;
        let memberName;
        let existedPort = false;
        if (+port.name + '' === port.name) {
            tabId = port.name;
            memberName = 'san-devtools-panel';
        } else {
            tabId = port.sender.tab.id;
            memberName = port.name;
        }
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
        fn(tabId, memberName, existedPort);
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
    /**
     * 设置消息拦截器
     * @param fn 用于拦截 message
     */
    setMessageIntercept(fn: Function) {
        if (typeof fn === 'function') {
            this._messageIntercept = fn;
            return true;
        }
        return false;
    }
}
const portManager = new PortManager();
export {portManager};