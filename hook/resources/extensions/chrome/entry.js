/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Entry for content script context.
 */


/* globals chrome */

function injectUrlSync(url) {
    let request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    let code;
    if (request.status === 200) {
        code = request.responseText;
    }
    const script = document.createElement('script');
    script.textContent = code;
    document.documentElement.appendChild(script);
    script.parentElement.removeChild(script);
    return script;
}

injectUrlSync(chrome.runtime.getURL('init.js'));
injectUrlSync(chrome.runtime.getURL('san_devhook.js'));
