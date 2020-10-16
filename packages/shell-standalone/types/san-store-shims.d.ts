declare module 'san-store' {
    export class Store {
        constructor(...args: any[]);
        addAction(name: any, action: any): void;
        dispatch(name: any, payload: any): any;
        getState(name: any): any;
        listen(listener: any): void;
        unlisten(listener: any): void;
    }
    export const version: string;
    export namespace connect {
        function createConnector(store: any): any;
        function san(mapStates: any, mapActions: any): any;
    }
    export namespace store {
        const actions: {};
        const listeners: any[];
        const log: boolean;
        const name: string;
        const raw: {};
        const stateChangeLogs: any[];
        function addAction(name: any, action: any): void;
        function dispatch(name: any, payload: any): any;
        function getState(name: any): any;
        function listen(listener: any): void;
        function unlisten(listener: any): void;
        namespace actionCtrl {
            const index: {};
            const len: number;
            const list: any[];
            function detectDone(id: any): void;
            function done(id: any): void;
            function getById(id: any): any;
            function start(id: any, name: any, payload: any, parentId: any): void;
            namespace store {
                const actions: {};
                const listeners: any[];
                const log: boolean;
                const name: string;
                const raw: {};
                const stateChangeLogs: any[];
                function addAction(name: any, action: any): void;
                function dispatch(name: any, payload: any): any;
                function getState(name: any): any;
                function listen(listener: any): void;
                function unlisten(listener: any): void;
                namespace actionCtrl {
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const detectDone: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const done: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const getById: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const index: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const len: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const list: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const start: any;
                    // Too-deep object hierarchy from san_store.store.actionCtrl.store.actionCtrl
                    const store: any;
                }
            }
        }
    }
}
