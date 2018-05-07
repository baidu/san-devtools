/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Bind component data to DOM object.
 * @author luyuan<luyuan.china@gmail.com>
 */


import {isSanComponent} from './utils';


function bindComponentInst(el, component) {

}


function bindComponentData(el, component) {

}


function bindComponentPath(el, component) {

}


function bindComponentTreeIndex(el, component) {

}


function bindComponentInfo(el, component) {

}


export function bind(component) {
    if (!component || !isSanComponent(component)) {
        return;
    }
    bindComponentInst(component.el, component);
    bindComponentData(component.el, component);
    bindComponentPath(component.el, component);
    bindComponentTreeIndex(component.el, component);
    bindComponentInfo(component.el, component);
}

