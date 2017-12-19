/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Background popup page
 * @author luyuan(luyuan.china@gmail.com)
 */

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

function updateOptions() {
    connector.sendMessage('background:options', {}).then(res => {
        connector.sendMessage('devtool:options_updated', res);
    });
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
        document.querySelector('#readonly_data').checked = !!+options[
            'readonly_for_component_data'];
        document.querySelector('#readonly_store').checked = !!+options[
            'readonly_for_store'];
    });

}, 100);

window.addEventListener('load', e => {
    document.querySelector('#no_version_shown').addEventListener('click', e => {
        connector.sendMessage('background:options', {
            'do_not_show_version': +e.target.checked,
        });
        updateOptions();
    });
    document.querySelector('#readonly_data').addEventListener('click', e => {
        connector.sendMessage('background:options', {
            'readonly_for_component_data': +e.target.checked,
        });
        updateOptions();
    });
    document.querySelector('#readonly_store').addEventListener('click', e => {
        connector.sendMessage('background:options', {
            'readonly_for_store': +e.target.checked,
        });
        updateOptions();
    });
});
