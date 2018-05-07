/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Utils
 */


import {isBrowser} from './context';

export function getDevtoolNS() {
    let global = isBrowser() ? window : global;
    if (!global || typeof global[SAN_DEVTOOL] !== 'object') {
        return null;
    }
    return global[SAN_DEVTOOL];
}


export function isSanComponent(component) {
    let ns = getDevtoolNS();
    if (!ns || !ns.san) {
        return false;
    }
    return component instanceof ns.san.Component;
}


export function getXPath(element) {
    if (!element) {
        return '';
    }
    if (element.id !== '') {
        return 'id("' + element.id + '")';
    }
    if (element === document.body) {
        return element.tagName;
    }

    let ix = 0;
    let siblings = element.parentNode.childNodes;
    for (let i of siblings) {
        if (i === element) {
            return getXPath(element.parentNode) + '/' + element.tagName
                + '[' + (ix + 1) + ']';
        }
        if (i.nodeType === Node.ELEMENT_NODE
            && i.tagName === element.tagName) {
            ix++;
        }
    }
}


export function parseUrl(url) {
    let params = {};
    for (let s of url.slice(url.indexOf('?') + 1).split('&')) {
        let kv = s.split('=');
        params[kv[0]] = kv[1];
    }
    return params;
}


export function normalizeVersionNumber(version) {
    let reg = /^\d+(\.\d+)+(\-\b\w*\b)?$/;
    if (!version || typeof version !== 'string') {
        return null;
    }
    if (!reg.test(version)) {
        return '';
    }
    return version;
}


export function toLocaleDatetime(timestamp) {
    return new Date(+timestamp).toLocaleString(
        navigator.language,
        {
            hour12: false,
            month: '2-digit',
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            day: '2-digit',
            year: '2-digit',
            weekday: 'short'
        }
    );
}


export function isContentScript() {
    return typeof chrome === 'object' && chrome.extension;
}


export function getSanIdElementCount() {
    return document.evaluate('//*[contains(@id,"_san_")]', document, null,
        XPathResult.ORDERED_NODE_SNAPSHOT_TYPE).snapshotLength;
}


export function toStr(varient) {
    function toString(va) {
        if (va instanceof RegExp) {
            return va.toString();
        }
        switch (typeof va) {
            case 'function':
                return va.toString();
            case 'object': {
                if (Array.isArray(va)) {
                    let v = Object.assign([], va);
                    v.forEach((e, i) => {
                        v[i] = toString(v[i]);
                    });
                    return v;
                }
                else {
                    let v = Object.assign({}, va);
                    for (let k in v) {
                        v[k] = toString(v[k]);
                    }
                    return v;
                }
            }
            case 'number':
            case 'string':
            case 'boolean':
            default:
                return va + '';
        }
    }

    let s = toString(varient);
    return typeof s === 'object' ? JSON.stringify(s) : s;
}


export function toVar(string) {
    if (typeof string !== 'string') {
        return string;
    }
    function toVarient(v) {
        console.log(v, typeof v);
        if (typeof v === 'object') {
            if (Array.isArray(v)) {
                v.forEach((e, i) => {
                    v[i] = toVarient(v[i]);
                });
                return v;
            }
            else {
                for (let k in v) {
                    v[k] = toVarient(v[k]);
                }
                return v;
            }
        }
        try {
            if (!v) {
                throw new Error();
            }
            /*eslint-disable*/
            return eval(`(function(){return ${v}})()`);
            /*eslint-enable*/
        }
        catch (ex) {
            return v;
        }
    }

    let va;
    try {
        va = JSON.parse(string);
    }
    catch (ex) {
        va = string;
    }
    return toVarient(va);
}
