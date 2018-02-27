/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Interchange station for exchanging messages between page context and
 *       content script context.
 */

import Messenger from 'chrome-ext-messenger';

import highlighter from './highlighter';
import utils from '../common/utils';
import TaskDelayer from '../common/task_delayer';

let messenger = new Messenger();
let c = messenger.initConnection('interchange', () => {});

const INTERVAL = 1000;
let sanMessageQueue = [];
let lastSanMessageQueueSent = 0;
let onceSanMessageChecker = null;
let selectedSanId = null;

chrome.runtime.onMessage.addListener((request, sender, sendResponse) => {
    if (!request || request.message !== 'tabUpdated') {
        return;
    }
    c.sendMessage('devtool:rebuild', {}, () => {});
});

function init() {
    let sanMsgDelayer = new TaskDelayer({
        interval: 1000,
        delay: 100,
        task: queue => {
            c.sendMessage('devtool:component_tree_mutations',
                {queue: _.clone(queue)}, () => {});
        }
    });
    window.addEventListener('message', e => {
        let eventData = e.data;
        if (!eventData) {
            return;
        }
        let message = eventData.message;
        if (typeof message !== 'object') {
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
            //postSanMessageToDevtool(eventData);
            eventData.count = utils.getSanIdElementCount();
            sanMsgDelayer.spawn(eventData);
        }
    });
    initHighlightEvent();
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
