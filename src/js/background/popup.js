/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Background popup page
 */

import san from 'san';
import Messenger from 'chrome-ext-messenger';

function update(version) {
    if (typeof version !== 'string') {
        return false;
    }
    let versionEl = document.getElementById('version');
    if (!versionEl) {
        return;
    }
    if (version === 'N/A') {
        versionEl.innerHTML = 'San detected, unknown version.';
    } else {
        versionEl.innerHTML = 'San <b>' + version + '</b> detected.';
    }
    versionEl.innerHTML
        += '<br />Please open devtools and click San panel for the detail.'
    connector.sendMessage('background:no_blinking', {
        from: 'popup:detector'
    });
    return true;
}

let messenger = new Messenger();
let connector = messenger.initConnection('detector',
    (message, from, sender, sendResponse) => {
        update(message);
    }
);

// FIXME
setTimeout(() => {
    connector.sendMessage('content_script:san_version', {
        from: 'popup:detector'
    }, res => {
        console.log(res);
        update(res);
    });
}, 100);
