import {Component} from '../hook';
import CircularJSON from '@shared/utils/circularJSON';

function getComponentName(component: Component) {
    // eslint-disable-next-line
    let name = component && ((component.source && component.source.tagName) || component.subTag || component.constructor.name);
    if (!name || name.length === 1) {
        name = component ? component.tagName : 'Component';
    }
    return name;
}
// 生成路由信息。
function getRouteInfo(component: Component) {
    let routeData = component.data.get('route');
    if (routeData && routeData.path) {
        return {
            id: component.id,
            timestamp: Date.now(),
            routeData: CircularJSON.parse(CircularJSON.stringify(routeData.path))
        };
    }
    return {
        id: component.id,
        timestamp: Date.now(),
        to: component.data.raw.to ? CircularJSON.parse(CircularJSON.stringify(component.data.raw.to)) : undefined
    };
}
// 根据 component 实例的 parentComponent 生成组件在 DOM 中的父子关系路径。
function getComponentPath(component: Component) {
    let dataTmp = component;
    let path = [dataTmp.id];
    if (dataTmp.parentComponent && dataTmp.parentComponent.id) {
        while (dataTmp) {
            dataTmp = dataTmp.parentComponent;
            if (dataTmp) {
                path.unshift(dataTmp.id);
            }
        }
    }
    return path;
}
function getComponentRouteExtraData(component: Component) {
    let data = getRouteInfo(component);
    return data.routeData || data.to
        ? [
            {
                text: data.routeData ? 'Route: ' + data.routeData : data.to ? 'to: ' + data.to : ''
            }
        ]
        : [];
}

export {getComponentName, getRouteInfo, getComponentPath, getComponentRouteExtraData};
