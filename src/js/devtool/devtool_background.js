/**
 * San Devtool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Create developer tools panel
 */

import Messenger from 'chrome-ext-messenger';

let created = false;

function createDevtoolPanelIfNeeded() {
    chrome.devtools.network.onNavigated.addListener(createDevtoolPanelIfNeeded);

    if (created) {
        return;
    }

    clearInterval(createdCheckInterval);

    chrome.devtools.inspectedWindow.eval(
        '!!(window.__san_devtool__&&window.__san_devtool__.san)', hasSan => {
            if (!hasSan || created) {
                return;
            }
            
            chrome.devtools.panels.create(
                'San',
                '../../icons/logo128.png',
                'html/devtool/panel_index.html',
                function (panel) {
                    // panel loaded
                    console.log(panel);
                }
            );
            created = true;
        }
    );
}

let messenger = new Messenger;
let setterConnect = messenger.initConnection(
    'set_background_treedata',
    (message, from, sender, sendResponse) => {
        console.log('set_background_treedata', message);
        window.treeData = message;
        setterConnect.sendMessage('devtool:comp_tree_data', message, () => {});
    }
);
let getterConnect = messenger.initConnection(
    'get_background_treedata',
    (message, from, sender, sendResponse) => {
        console.log('get_background_treedata', window.treeData);
        sendResponse(window.treeData);
    }
);

//chrome.devtools.network.onNavigated.addListener(createDevtoolPanelIfNeeded);

let createdCheckInterval = setInterval(createDevtoolPanelIfNeeded, 1000);

createDevtoolPanelIfNeeded();
