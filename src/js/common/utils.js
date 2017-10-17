/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Utils
 */

export default {

    normalizeVersionNumber(version) {
        let reg = /^\d+(\.\d+)+(\-\b\w*\b)?$/;
        if (!version || typeof version !== 'string') {
            return null;
        }
        if (!reg.test(version)) {
            return '';
        }
        return version;
    },

    toLocaleDatetime(timestamp) {
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
    },

    isBrowser() {
        return typeof window !== 'undefined';
    },

    isContentScript() {
        return chrome && chrome.extension;
    },

    isSanComponent(component) {
        if (!window[SAN_DEVTOOL] || !window[SAN_DEVTOOL].san) {
            return false;
        }
        return component instanceof window[SAN_DEVTOOL].san.Component;
    },

    getXPath(element) {
        if (!element) {
            return '';
        }
        if (element.id !== '') {
            return 'id("' + element.id + '")';
        }
        if (element === document.body) {
            return element.tagName;
        }

        let c = 0;
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
    },

    getSanIdElementCount() {
        return document.evaluate('//*[contains(@id,"_san_")]', document, null,
            XPathResult.ORDERED_NODE_SNAPSHOT_TYPE).snapshotLength;
    }

};
