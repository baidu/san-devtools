/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Interchange station for page context and content script context.
 */

import Messenger from 'chrome-ext-messenger';

import highlighter from './highlighter';

function init() {
    window.addEventListener('message', e => {
        let eventData = e.data;
        if (!eventData) {
            return;
        }
        let message = eventData.message;
        if (!message) {
            return;
        }
        if (message.startsWith('comp-')) {
            postSanMessageToDevtool(eventData);
        }
    });
    initHighlightEvent();
}

function postSanMessageToDevtool(data) {
    let messenger = new Messenger();
    let c = messenger.initConnection('interchange', () => {});
    c.sendMessage('devtool:component_tree', data, () => {});
}

function initHighlightEvent() {
    let messenger = new Messenger();
    let highlightConnector = messenger.initConnection(
        'highlight_dom',
        (message, from, sender, sendResponse) => {
            let id = message.id;
            highlighter.highlight(document.getElementById(id));
        }
    );
    let unhighlightConnector = messenger.initConnection(
        'unhighlight_dom',
        (message, from, sender, sendResponse) => {
            highlighter.unhighlight();
        }
    );
}

export default {
    init
}
