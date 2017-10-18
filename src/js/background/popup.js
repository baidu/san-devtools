/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Background popup page
 * @author luyuan(luyuan.china@gmail.com)
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
    document.querySelector('a img').style.filter = 'none';
    versionEl.innerHTML
        += '<br />Please open devtools and click San panel for the detail.'
    connector.sendMessage('background:version_visibility', {
        from: 'popup:detector',
        versionVisibility: false,
        version
    });
    return true;
}

let messenger = new Messenger();
let connector = messenger.initConnection('detector',
    (message, from, sender, sendResponse) => {
        update(message);
    }
);

let options = {};

// FIXME
setTimeout(() => {
    connector.sendMessage('content_script:san_version', {
        from: 'popup:detector'
    }).then(res => {
        update(res);
    });

    connector.sendMessage('background:options', {}).then(res => {
        options = res;

        document.querySelector('#no_version_shown').checked = !!+options[
            'do_not_show_version'];
    });

}, 100);

window.addEventListener('load', e => {
    document.querySelector('#no_version_shown').addEventListener('click', e => {
        connector.sendMessage('background:options', {
            'do_not_show_version': e.target.checked ? 1 : 0,
        });
    });
});
