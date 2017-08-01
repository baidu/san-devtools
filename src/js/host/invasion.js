/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Code invasion
 */

import Messenger from 'chrome-ext-messenger';

import injector from './injector';
import {installSanHook} from './hook';
import {serialize} from './components';
import {listeners, postSanMessages, getXPath} from './listeners';
import {version, detectSan} from './version'
import constants from '../common/constants';

// Inject scripts to page context.
injector.fromContentScript(installSanHook.toString(), 'window');
injector.fromContentScript((function () {
    let code = '"';
    for (const [i, e] of constants.sanEventNames.entries()) {
        code += (i === 0 ? '': ',') + e;
    }
    code += '".split(",")';
    return code;
})(), 'window', 'sanEventNames');
injector.fromContentScript(serialize.toString(), 'window', serialize.name);
injector.fromContentScript(postSanMessages.toString(), 'window');
injector.fromContentScript(getXPath.toString(), 'window', getXPath.name);
injector.fromContentScript(detectSan.toString(), 'window');

// Initialize content script.
for (let e of constants.sanEventNames) {
    listeners.addSanListener(e, 'content_script');
}

let messenger = new Messenger();
let messageHandler = function(message, from, sender, sendResponse) {
    if (window.sanVersion) {
        sendResponse(window.sanVersion);
    }
};
let connector = messenger.initConnection('san_version', messageHandler);
version.getVersionNumberFromPage(sanVersion => {
    connector.sendMessage(
        'background:version', sanVersion, function (res) {
          // Nothing.
        }
    );
});
