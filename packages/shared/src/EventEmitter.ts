export type EventType = string | symbol;
export type Listener<T = any> = (event?: T) => void;

export type EventListenerList = Listener[];

export type EventListenerMap = Map<EventType, EventListenerList>;

export default class EventEmitter {
    protected listeners: EventListenerMap = new Map();
    on(eventName: EventType, listener: Listener) {
        let listeners = this.listeners.get(eventName);
        if (typeof listener !== 'function') {
            throw new Error(`[EventEmitter.on] ${listener} is not Function`);
        }
        const added = listeners && listeners.push(listener);
        if (!added) {
            this.listeners.set(eventName, [listener]);
        }
    }
    once(eventName: EventType, listener: Listener) {
        let onceListener = (...args: [any?]) => {
            this.off(eventName, onceListener);
            listener.apply(this, args);
        };
        this.on(eventName, onceListener);
    }
    off(eventName: EventType, listener: Listener) {
        const listeners = this.listeners.get(eventName);
        if (listeners) {
            listeners.splice(listeners.indexOf(listener) >>> 0, 1);
        }
    }
    emit(eventName: EventType, data?: any) {
        const listeners = this.listeners.get(eventName);
        if (listeners && listeners.length > 0) {
            listeners.map(listener => {
                listener(data);
            });
        }
    }
    removeAllListeners(eventName?: EventType) {
        if (eventName) {
            const listeners = this.listeners.get(eventName);
            if (listeners && listeners.length > 0) {
                listeners.length = 0;
                this.listeners.delete(eventName);
            }
        } else {
            this.listeners.clear();
        }
    }
}
