/**
 * San Devtools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Create developer tools panel
 */

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
                }
            );
            created = true;
        }
    );
}

chrome.devtools.network.onNavigated.addListener(createDevtoolPanelIfNeeded);

let createdCheckInterval = setInterval(createDevtoolPanelIfNeeded, 1000);

createDevtoolPanelIfNeeded();
