
/* global __DEBUG__ */

import Bridge from '@shared/Bridge';

export default function (ws) {
    const messageListeners: Function[] = [];

    ws.on('message', event => {
        let data: any;
        try {
            if (typeof event.data === 'string') {
                data = JSON.parse(event.data);
                if (__DEBUG__) {
                    window.logger.green('WebSocket GET', data);
                }
            }
            else {
                throw Error();
            }
        }
        catch (e) {
            console.error(`[San DevTools] Failed to parse JSON: ${event.data}`);
            return;
        }
        messageListeners.forEach(fn => {
            try {
                fn(data);
            }
            catch (error) {
                // jsc doesn't play so well with tracebacks that go into eval'd code,
                // so the stack trace here will stop at the `eval()` call. Getting the
                // message that caused the error is the best we can do for now.
                console.log('[San DevTools] Error calling listener', data);
                console.log('error:', error);
                throw error;
            }
        });
    });

    return new Bridge({
        listen(fn: Function) {
            messageListeners.push(fn);
            return () => {
                const index = messageListeners.indexOf(fn);
                if (index >= 0) {
                    messageListeners.splice(index, 1);
                }
            };
        },
        send(data) {
            if (__DEBUG__) {
                window.logger.red('WebSocket SEND', data);
            }
            ws.sendRawMessage(JSON.stringify(data));
        }
    });
}
