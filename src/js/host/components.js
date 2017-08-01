/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Serialize component data 
 */

function serialize(component) {
    if (!component || component.constructor.name !== 'ComponentClass'
        || !component.el) {
        return null;
    }
    return {
        id: component.id,
        classList: Array.prototype.slice.call(component.el.classList),
        elId: component.el.id,
        tagName: component.tagName,
        innerText: component.el.innerText,
        innerHTML: component.el.innerHTML,
        xpath: window[SAN_DEVTOOL].getXPath(component.el),
        subTag: component.subTag,
        // FIXME: try to use buble.
        data: window.eval('JSON.stringify')(component.data.raw),
        parentComponent: arguments.callee(component.parentComponent),
        owner: arguments.callee(component.owner)
    };
}

function updateTreeData() {

}

export {
    serialize,
    updateTreeData
}
