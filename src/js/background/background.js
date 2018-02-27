/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Background script
 * @author luyuan(luyuan.china@gmail.com)
 */

import Messenger from 'chrome-ext-messenger';

function updateBrowserAction(ver, visibility, from) {
    if (typeof ver === 'undefined') {
        return;
    }

    let tabId = from.match(/\d+$/)[0];
    if (tabId) {
        updateBadgeTextAndIcon(+tabId, ver, visibility);
    }
}

function updateBadgeTextAndIcon(tabId, ver, visibility) {
    chrome.browserAction.setBadgeText({
        tabId,
        text: visibility && !+options['do_not_show_version'] ? ver : ''
    });
    chrome.browserAction.setIcon({
        tabId,
        path: {
            16: 'icons/logo16.png',
            48: 'icons/logo48.png',
            128: 'icons/logo128.png'
        }
    });
}

let options = window.localStorage;

let messenger = new Messenger();

let versionMessageHandler = function(message, from, sender, sendResponse) {
    updateBrowserAction(message, true, from);
};

let versionVisibilityMessageHandler = function(
    message, from, sender, sendResponse) {
    updateBrowserAction(message.version, message.versionVisibility, from);
}

let optionsMessageHandler = function(message, from, sender, sendResponse) {
    for (let k in message) {
        options[k] = message[k];
    }
    sendResponse(options);
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

let versionVisibilityConnector = messenger.initConnection(
    'version_visibility', versionVisibilityMessageHandler);

let optionsConnector = messenger.initConnection(
    'options', optionsMessageHandler);

chrome.tabs.onUpdated.addListener((tabId, changeInfo, tab) => {
    if (typeof changeInfo !== 'object' || changeInfo.status !== 'complete') {
        return;
    }
    chrome.tabs.sendMessage(tabId, {
        message: 'tabUpdated'
    });
});
