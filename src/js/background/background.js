/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Background script
 */

import Messenger from 'chrome-ext-messenger';
import ChromePromise from 'chrome-promise';

function updateBrowserActionBadge(ver) {
    if (typeof ver === 'undefined') {
        return;
    }

    const chromep = new ChromePromise();

    let count = 0;

    chromep.tabs.query({
        active: true,
        currentWindow: true
    }).then((tabs) => {
        window.setInterval(() => {
            chrome.browserAction.setBadgeText({
                tabId: tabs[0].id,
                text: count++ % 2 === 0 && !noBlinking ? ver : ''
            });
            chrome.browserAction.setIcon({
                tabId: tabs[0].id,
                path: {
                    16: 'icons/logo16.png',
                    48: 'icons/logo48.png',
                    128: 'icons/logo128.png'
                }
            });
        }, 1000);
    });
}


let messenger = new Messenger();

let versionMessageHandler = function(message, from, sender, sendResponse) {
    updateBrowserActionBadge(message);
};

let noBlinking = false;
let noBlinkingMessageHandler = function(message, from, sender, sendResponse) {
    noBlinking = true;
}

let connectedHandler  = function(extensionPart, port, tabId) {
};

let disconnectedHandler  = function(extensionPart, port, tabId) {
};

messenger.initBackgroundHub({
    connectedHandler: connectedHandler,
    disconnectedHandler: disconnectedHandler
});

let versionConnector = messenger.initConnection(
    'version', versionMessageHandler);

let noBlinkingConnector = messenger.initConnection(
    'no_blinking', noBlinkingMessageHandler);
