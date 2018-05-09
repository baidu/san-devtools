/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Inject the script to page context.
 */


/* globals SAN_DEVTOOL */

function generateCodeString(codeArg, thisArg, mountingKey) {
    const ns = SAN_DEVTOOL;
    let code = '';

    if (mountingKey) {
        code = `window.${ns}.${mountingKey} = ${codeArg}`;
        return code;
    }

    switch (typeof codeArg) {
        case 'string':
            code = /^function/i.test(codeArg)
                ? `(${codeArg})(${thisArg})`
                : `(function(){${codeArg}}).call(${thisArg})`;
            break;
        case 'function':
            code = `(${codeArg.toString()}).call(${thisArg})`;
            break;
        default:
            break;
    }
    return code;
}

function inject(codeString) {
    if (!codeString) {
        return null;
    }
    const script = document.createElement('script');
    script.textContent = codeString;
    if (document.documentElement) {
        document.documentElement.appendChild(script);
        script.parentElement.removeChild(script);
    }
    return script;
}

function injectUrl(url) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.documentElement.appendChild(script);
        script.parentElement.removeChild(script);
    });
}

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

function executeJavaScriptFromDevtool(codeString) {
    return new Promise(function (resolve, reject) {
        !chrome.devtools && reject('Not in devtools.');
        chrome.devtools.inspectedWindow.eval(codeString, (res, ex) => {
            ex && ex.isException && reject(ex.value);
            resolve(res);
        });
    });
}


// Must be run in content script context. 
export function fromContentScript(codeArg, thisArg, mountingKey) {
    inject(generateCodeString(codeArg, thisArg, mountingKey));
}

export function fromExtensionUrl(url) {
    return injectUrl(url);
}

export function fromExtensionUrlSync(url) {
    return injectUrlSync(url);
}

export function fromDevtool(code, ...args) {
    if (typeof code === 'function') {
        code = `(${code.toString()}).apply(null, [${args.toString()}])`;
    }
    return executeJavaScriptFromDevtool(code);
}
