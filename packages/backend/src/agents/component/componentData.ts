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

/**
 * 用于生成 eventInfo 数据
 *
 * @param {Component} component san.js 组件实例
 * @param {IModifyMsg} message JSON 数据的修改信息
 * @return {Boolean}} 修改的数据是否与 route 相关
 */
function doRoute(component: Component, message: IModifyMsg) {
    if (isRouterComp(component) && message.path[0] === 'route') {
        return true;
    }
    return false;
}

/**
 * 处理 Frontend JSON View 的数据修改
 *
 * @param {DevToolsHook<{}>} hook 钩子
 * @param {IModifyMsg} message JSON 数据的修改信息
 * @return {*} void
 */
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

/**
 * 用于获取函数体
 *
 * @param {*} data 函数
 * @return {ComponentFnObj} 函数体对象
 */
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

/**
 * 用于获取组件计算属性数据
 *
 * @param {*} computed 计算属性源数据
 * @param {*} computedDeps 计算属性的依赖
 * @return {ComponentFnObj} 函数体对象
 */
function getComponentComputed(computed: Component['computed'], computedDeps: Component['computedDeps']): ComputedData {
    if (!computed) {
        return [];
    }
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

/**
 * 用于获取组件详细数据
 *
 * @param {Component} component 组件实例
 * @return {ComponentData} 组件详细数据
 */
export function getComponentData(component: Component): ComponentData {
    return {
        data: component.data.raw || component.data.data,
        messages: getComponentObj(component.messages),
        filters: getComponentObj(component.filters),
        computed: getComponentComputed(component.computed, component.computedDeps),
    };
}
