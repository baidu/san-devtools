/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Interchange station for page context and content script context.
 */

import Messenger from 'chrome-ext-messenger';

import highlighter from './highlighter';
import utils from '../common/utils';

let messenger = new Messenger();
let c = messenger.initConnection('interchange', () => {});

const INTERVAL = 1000;
let sanMessageQueue = [];
let lastSanMessageQueueSent = 0;
let onceSanMessageChecker = null;

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
        if (message.startsWith('store-')) {
            postStoreMessageToDevtool(eventData);
            return;
        }
        // 这几种事件暂时不向 devtool 发送，仅用于更新 history。
        if (message === 'comp-compiled' || message === 'comp-inited'
            || message === 'comp-created' || message === 'comp-disposed') {
            return;
        }
        // san-router 消息单独处理。
        if (message === 'comp-route') {
            postRouteMessageToDevtool(eventData);
            return;
        }
        // Component 的 7 种事件。
        if (message.startsWith('comp-')) {
            postSanMessageToDevtool(eventData);
        }
    });
    initHighlightEvent();
}

function checkSanMessageQueue() {
    onceSanMessageChecker = window.setTimeout(() => {
        c.sendMessage('devtool:component_tree_mutations',
            {queue: _.clone(sanMessageQueue)}, () => {});
        sanMessageQueue.splice(0, sanMessageQueue.length);
        window.clearTimeout(onceSanMessageChecker);
    }, INTERVAL / 10);
}

function postSanMessageToDevtool(data) {
    data.count = utils.getSanIdElementCount();
    if (!lastSanMessageQueueSent) {
        lastSanMessageQueueSent = Date.now();
    }
    if (Date.now() - lastSanMessageQueueSent < INTERVAL) {
        window.clearTimeout(onceSanMessageChecker);
        sanMessageQueue.push(data);
        checkSanMessageQueue();
    } else {
        lastSanMessageQueueSent = Date.now();
        c.sendMessage('devtool:component_tree_mutations',
            {queue: _.clone(sanMessageQueue)}, () => {});
        sanMessageQueue.splice(0, sanMessageQueue.length);
    }
}

function postRouteMessageToDevtool(data) {
    c.sendMessage('devtool:routes', data, () => {});
}

function postStoreMessageToDevtool(data) {
    c.sendMessage('devtool:store_mutation', data, () => {});
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
