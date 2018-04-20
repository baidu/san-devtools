/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Popup script.
 */


function update(version) {
    if (version) {
        document.getElementById('version').innerHTML
            = `San ${version} detected.`;
        document.querySelector('a img').classList.remove('null');
    }
    else {
        document.querySelector('a img').classList.add('null');
    }
}

chrome.tabs.query(
    {
        currentWindow: true,
        active: true
    },
    tabs => {
        if (typeof tabs !== 'object') {
            return;
        }
        chrome.tabs.sendMessage(tabs[0].id, {
            message: 'get_version'
        });
    }
);

window.addEventListener('load', e => {
    update();
});

chrome.runtime.onMessage.addListener(function (req, sender, send) {
  console.log(req)
    if (req.message === 'version') {
        update(req.data);
    }
});
