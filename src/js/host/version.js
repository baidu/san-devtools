/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file 版本号处理。
 */

import Messenger from 'chrome-ext-messenger';

import utils from '../common/utils';

function init() {
    let messenger = new Messenger();
    let messageHandler = function(message, from, sender, sendResponse) {
        if (window.sanVersion) {
            sendResponse(window.sanVersion);
        }
    };
    let connector = messenger.initConnection('san_version', messageHandler);
    getVersionNumberFromPage(sanVersion => {
        connector.sendMessage(
            'background:version', sanVersion, function (res) {
              // Do nothing.
            }
        );
    });
}


// Content script 接收版本信息，并保存在 content script 全局下。
function getVersionNumberFromPage(callback) {
    window.addEventListener('message', e => {
        if (e.data && e.data.message === 'version') {
            window.sanVersion =
                utils.normalizeVersionNumber(e.data.sanVersion);
            if (window.sanVersion === '') {
                window.sanVersion = 'N/A';
            }
            callback.bind(this)(window.sanVersion);
        }
    });
}

export default {
    init
};
