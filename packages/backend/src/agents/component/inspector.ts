import {Component, DevToolsHook} from '../../hook';

let inspectorListened = false;

// 组件卸载或者挂载的时候将 idPath 存储到 dom 上
export const sanInternalIdPath = '__SAN_INS_ID_PATH__';
export function inspectSanInstance(component: Component, idPath: string[]) {
    if (!component || !component.el) {
        return false;
    }
    let el = component.el;
    el[sanInternalIdPath] = idPath;
    return true;
}

// 根据该 dom 上是否存在 idPath 来判断是否是 san 组件
type ISanEl = Element & {'__SAN_INS_ID_PATH__'?: string} | null;
/**
 * 从当前 dom 开始往上找，知道 dom 具备 __SAN_INS_ID_PATH_
 * @param el
 */
export function findRelatedComponentId(el: ISanEl) {
    if (!el) {
        return;
    }
    while (!el[sanInternalIdPath] && el.parentElement) {
        el = el.parentElement;
    }
    return el[sanInternalIdPath];
}

// 当 san-app 页面的 dom 被右键点击的时候，找到上层san组件对应的 dom
export function setupInspectInstance(hook: DevToolsHook<{}>) {
    if (typeof navigator === 'undefined') {
        return;
    }
    if (!inspectorListened) {
        inspectorListened = true;
        // FIXME: chrome 修改 ua 后，右键选择的 dom 不正确。
        document && document.addEventListener('contextmenu', event => {
            const el = event.target;
            if (el) {
                // eslint-disable-next-line
                let idPath = findRelatedComponentId(el as ISanEl) || [];
                if (idPath) {
                    hook.sanDevtoolsContextMenuTargetIdPath = idPath;
                    return;
                }
            }
            hook.sanDevtoolsContextMenuTargetIdPath = null;
        });
    }
}