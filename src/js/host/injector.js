/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Inject the script to page context.
 */

function generateCodeString(codeArg, thisArg, mountingKey) {
    let code = '';

    if (mountingKey) {
        code = 'window["' + SAN_DEVTOOL + '"].' + mountingKey + '=' + codeArg;
        return code;
    }

    switch (typeof codeArg) {
        case 'string':
            code = /^function/i.test(codeArg)
                ? '(' + codeArg + ')(' + thisArg + ');' 
                : '(function(){' + codeArg + '}).call(' + thisArg + ');'; 
            break;
        case 'function':
            code = '(' + codeArg.toString() + ').call(' + thisArg + ');';
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

export default {

    // Must be run in content script context. 
    fromContentScript(codeArg, thisArg, mountingKey) {
        inject(generateCodeString(codeArg, thisArg, mountingKey));
    },

    fromExtensionUrl(url) {
        return injectUrl(url);
    },

    fromExtensionUrlSync(url) {
        return injectUrlSync(url);
    },

    fromDevtool(code, ...args) {
        if (typeof code === 'function') {
            code = '(' + code.toString() + ').apply(null, [' + args.toString() + '])';
        }
        return executeJavaScriptFromDevtool(code);
    },

    fromBackground(code) {

    }

};
