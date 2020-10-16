import {DevToolsHook, Component} from '../../hook';
interface IModifyMsg{
    id: string; // 组件 id
    type: 'change' | 'rename' | 'delete' | 'append'; // 数据修改类型
    path: string[]; // 数据的路径
    oldVal: any; // 原来的值/健，父节点的数据类型，'value'
    newVal: any; // 现在的值/健, null
}

function isRouterComp(component: Component) {
    return !!component.data.raw.route;
}

function doRoute(component: Component, message: IModifyMsg) {
    if (isRouterComp(component) && message.path[0] === 'route') {
        // TODO: 这里只需要留存给 san-native 改变路由，对于 web 来说直接在 san 页面通过 location.href 改变即可
        // location.href = message.newVal;
        return true;
    }
    return false;
}

export function editComponentData(hook: DevToolsHook<{}>, message: IModifyMsg) {
    let {id, path} = message;
    if (path.length >= 1 && /^([\d])*$/.test(path[0] + '')) {
        return false;
    }
    let component = hook.componentMap.get(id);
    // 处理 router
    if (component && doRoute(component, message)) {
        return;
    }
    switch (message.type) {
        case 'change': {
            let {newVal} = message;
            let keyPath = path.reduce((pre: string, cur: string) => {
                return pre + `["${cur}"]`;
            });
            component?.data.set(keyPath, newVal);
            break;
        }
        case 'rename': {
            // TODO：此处 rename 实现的效果意义不大
            let {oldVal: oldKey, newVal: newKey} = message;
            let keyPath = '';
            if (path.length > 1) {
                keyPath = path.slice(0, -1).reduce((pre: string, cur: string) => {
                    return pre + `["${cur}"]`;
                });
            }
            let newKeyPath = keyPath ? `${keyPath}[${newKey}]` : newKey;
            let oldKeyPath = keyPath ? `${keyPath}[${oldKey}]` : oldKey;
            let oldVal = component?.data.get(oldKeyPath);
            component?.data.set(newKeyPath, oldVal);
            component?.data.set(oldKeyPath, undefined);
            oldVal = null;
            break;
        }
        case 'delete': {
            let {newVal: parentType} = message;
            if (parentType === 'array') {
                if (path.length <= 1) {
                    console.warn('[SAN_DEVTOOLS]: invalid data path', path);
                }
                let keyPath = path.slice(0, -1).reduce((pre: string, cur: string) => {
                    return pre + `["${cur}"]`;
                });
                component?.data.removeAt(keyPath, path[-1]);
            } else {
                let keyPath = path.reduce((pre: string, cur: string) => {
                    return pre + `["${cur}"]`;
                });
                component?.data.set(keyPath, undefined);
            }
            break;
        }
        case 'append': {
            let {oldVal: key, newVal} = message;
            if (path.length <= 1) {
                return;
            }
            let keyPath = path.slice(0, -1).reduce((pre: string, cur: string) => {
                return pre + `["${cur}"]`;
            });
            if (component?.data.get(keyPath)) {
                return;
            }
            if (key === 'value') {
                // 往数组中添加元素
                component?.data.push(keyPath, newVal);
            } else {
                // 往对象中添加值，该值由 json-view 决定，始终为 null
                component?.data.set(keyPath, null);
            }
            break;
        }
    }
}

interface ComponentFnObjItem {
    name: string;
    fn: string;
}
type ComponentFnObj = ComponentFnObjItem[];
function getComponentObj(data: {[index: string]: Function}): ComponentFnObj {
    return Object.entries(data).map(([name, fn]: [string, Function]) => {
        return {
            name,
            fn: fn && fn.toString()
        };
    });
}
interface ComputedDataItem {
    computedName: string;
    deps: Array<{key: string, value: any}>;
    fn: string;
}
type ComputedData = ComputedDataItem[];
function getComponentComputed(computed: Component['computed'], computedDeps: Component['computedDeps']): ComputedData {
    if (!computed) {
        return [];
    }
    // TODO：容错处理
    let computedDepsArr = Object.entries(computedDeps);
    let computedArr = Object.entries(computed);
    if (computedDepsArr.length !== computedArr.length) {
        console.warn('[SAN DEVTOOLS]: there is must be a trouble happen in san');
    }
    return computedDepsArr.map(([computedName, deps]) => {
        return {
            computedName,
            deps: Object.entries(deps).map(([key, value]) => {
                return {
                    key,
                    value
                };
            }),
            fn: computed[computedName].toString()
        };
    });
}

interface ComponentData {
    data: any;
    messages: ComponentFnObj;
    filters: ComponentFnObj;
    computed: ComputedData;
}
export function getComponentData(component: Component): ComponentData {
    return {
        data: component.data.raw || component.data.data,
        messages: getComponentObj(component.messages),
        filters: getComponentObj(component.filters),
        computed: getComponentComputed(component.computed, component.computedDeps),
    };
}