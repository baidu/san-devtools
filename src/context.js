/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Execution context.
 */


const WIN_CONSTRUCTOR_NAME = ['Window', 'DOMWindow'];
const WIN_CONSTRUCTOR_STRING = '[object Window]';

export const CONTEXT_TYPE = {
    BROWSER: 0,
    EXTENSION: 1
};

export function isBrowser() {
    return !isExtension() && typeof window === 'object'
        && (WIN_CONSTRUCTOR_STRING.indexOf(window.constructor.toString()) > -1
            || WIN_CONSTRUCTOR_NAME.indexOf(window.constructor.name) > -1);
}

export function isExtension() {
    return typeof chrome === 'object' && typeof chrome.extension === 'object';
}

export function getContext() {
    if (isBrowser()) {
        return CONTEXT_TYPE.BROWSER;
    }
    if (isExtension()) {
        return CONTEXT_TYPE.EXTENSION;
    }
}
