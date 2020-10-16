import san from 'san';
import Bridge from '@shared/Bridge';

// import {DevTools} from '@san-devtools/index';
// import 'santd/dist/santd.less';

import DevTools from '@san-devtools/DevTools.san';

import {initFrontend} from '@san-devtools/initFrontend';


let tabId = chrome.devtools.inspectedWindow.tabId;

const port = chrome.runtime.connect({
    name: '' + tabId
});

const bridge = new Bridge({
    // eslint-disable-next-line
    listen(fn: Function) {
        // chrome port
        port.onMessage.addListener(message => {
            fn(message);
        });
    },
    // eslint-disable-next-line
    send(data: any) {
        // chrome port
        port.postMessage(data);
    }
});

/**
 * 初始化 san-devtool 页面
 * @param connection
 */
function initialize(bridge: Bridge) {
    // 初始化 frontend 监听事件
    initFrontend(bridge);
    // 监听san-app页面重新加载，重新加载则清除 store，并卸载组件
    chrome.devtools.network.onNavigated.addListener(() => {
        bridge.emit('SYSTEM:backendDisconnected');
    });
    // 渲染 frontend 页面
    class Container extends san.Component {
        static template = /* html */ `
            <div>
                <s-devtools bridge="{{bridge}}"></s-devtools>
            </div>
        `;
        static components = {
            's-devtools': DevTools
        };
        initData() {
            return {
                bridge // 发送消息
            };
        }
    }
    let app = new Container();
    app.attach(document.querySelector('#root') as Element);
}


initialize(bridge);
