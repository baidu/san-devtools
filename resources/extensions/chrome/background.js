/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Background script.
 */


function setVersionHint(version, tabId) {
    console.log(tabId, version)
    chrome.browserAction.setBadgeText({
        tabId,
        text: version ? version : ''
    });
}

function update(version) {
    chrome.tabs.query(
        {
            currentWindow: true,
            active: true
        },
        tabs => {
            setVersionHint(version, typeof tabs === 'object' ? tabs[0].id : '');
        }
    );
}

update();

chrome.runtime.onMessage.addListener((req, sender, send) => {
    console.log('bac', req, sender)
    if (req.message === 'version') {
        update(req.data);
    }
});

