/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Component listeners
 */

import Messenger from 'chrome-ext-messenger';

import constants from '../common/constants';
import serialize from './components';

export function postSanMessages(global) {
    if (!global || !global[SAN_DEVTOOL]) {
        return;
    }
    let sanDevtool = global[SAN_DEVTOOL];
    // FIXME
    for (let m = 0; m < window[SAN_DEVTOOL].sanEventNames.length; m++) {
        sanDevtool.on(window[SAN_DEVTOOL].sanEventNames[m], (...data) => {
            if (!window.postMessage) {
                return;
            }
            let component = data[0];
            if (!component || component.constructor.name !== 'ComponentClass') {
                return;
            }
            if (component.el) {
                window.postMessage({
                    message: window[SAN_DEVTOOL].sanEventNames[m],
                    componentData: window[SAN_DEVTOOL].serialize(component)
                }, '*');
            }
        });
    }
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

    let c = 0;
    let siblings = element.parentNode.childNodes;
    for (let i of siblings) {
        if (i === element) {
            return getXPath(element.parentNode) + '/' + element.tagName
                + '[' + (ix + 1) + ']';
        }
        if (i.nodeType === ELEMENT_NODE && i.tagName === element.tagName) {
            ix++;
        }
    }
}

export const listeners = {

    // This function must be run in content script.
    addSanListener(msg, destination) {
        let messenger = new Messenger();

        let c = messenger.initConnection('component_listeners', () => {});

        window.addEventListener('message', e => {
            if (e.data && e.data.message === msg) {
                //c.sendMessage(destination + ':' + msg, e.data.args, () => {});
                console.log('message', e.data)
                this.pushComponentData(e.data.componentData);
            }
        });
    },

    pushComponentData(componentData) {
        if (!componentData) {
            return;
        }
        if (window.data) {
            window.data[componentData.id] = componentData;
        } else {
            window.data = {};
        }
    },

};
