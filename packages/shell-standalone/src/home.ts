/* global __config__ */

import Home from './Home.san';
let app: any;
const timerIdMap = new Map();
const handlers = {
    backendRemove(data: any) {
        // remove 延迟
        if (data.id) {
            const timerId = setTimeout(() => {
                const index = app.data.get('backends').findIndex((val: any) => val.id === data.id);
                app.data.splice('backends', [index, 1]);
                timerIdMap.delete(data.id);
            }, 1e3);
            timerIdMap.set(data.id, timerId);
        }
    },
    backendAppend(data: any) {
        const timerId = timerIdMap.get(data.id);
        if (timerId) {
            clearTimeout(timerId);
        }
        else {
            app.data.unshift('backends', data);
        }
    }
};

const protocol = location.protocol === 'https:' ? 'wss:' : 'ws:';
const ws = new window.WebSocket(`${protocol}//${__config__.wsHost}:${__config__.wsPort}/home/${__config__.sessionId}`);
ws.onopen = () => {
    // 绿色
    app.data.set('status', 'connected');

    ws.onmessage = (e: any) => {
        let data = e.data;
        data = JSON.parse(data);
        const handler = handlers[data.event] as Function;
        if (typeof handler === 'function') {
            handler(data.payload);
        }
    };
};
ws.onerror = e => {
    // 红色
    app.data.set('status', 'error');
    console.error(e);
};
ws.onclose = () => {
    // 灰色
    app.data.set('status', 'disconnected');
};


app = new Home();
app.attach(document.querySelector('#root') as Element);
