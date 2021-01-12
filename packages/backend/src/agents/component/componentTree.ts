import {ComponentTreeData, Component, DevToolsHook} from '../../hook';
import {
    getComponentName,
    getComponentPath,
    getComponentRouteExtraData
} from '../../utils/sanHelper';

/**
 * 当 frontend 主动获取组件树数据的时候生成组件树原始数据数组
 *
 * @param {*} hook 页面钩子
 * @return {Array} 组件数据与类型
 */
export function getAllComponentTree(hook: DevToolsHook<{}>) {
    let treeData = hook.data.treeData;
    let list = [...treeData];
    return list.map(item => {
        if (!item[1]) {
            return null;
        }
        return {type: 'add', data: item[1]};
    }).filter(Boolean);
}

/**
 * 用于 backend 生成数据
 *
 * @param {*} hook 页面钩子
 * @param {*} component 组件实例
 * @return {Object} 组件数据
 */
export function getComponentTree(hook: DevToolsHook<{}>, component: Component) {
    let {id} = component;
    let treeData: ComponentTreeData = {
        id: component.id,
        parentId: component.parentComponent ? component.parentComponent.id : '',
        ownerId: component.owner ? component.owner.id : '',
        tagName: component.tagName || '',
        displayName: getComponentName(component),
        extras: getComponentRouteExtraData(component),
        idPath: getComponentPath(component),
        treeData: []
    };
    if (!hook.storeComponentMap.has(id + '')) {
        return treeData;
    } else {
        let {
            mapStates,
            mapActionsKeys,
            storeName,
            extra
        } = hook.storeComponentMap.get(id + '');
        treeData.extras.push(extra);
        treeData.mapStates = mapStates;
        treeData.mapActionsKeys = mapActionsKeys;
        treeData.storeName = storeName;
        return treeData;
    }
}
