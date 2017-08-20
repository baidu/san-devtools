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

function injectURL(url) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        document.documentElement.appendChild(script);
    });
}

function mount(codeString) {

}

export default {

    // Must be run in content script context. 
    fromContentScript(codeArg, thisArg, mountingKey) {
        inject(generateCodeString(codeArg, thisArg, mountingKey));
    },

    fromContentScriptURL(url) {
        return injectURL(url);
    },

    fromDevtool(code) {

    },

    fromBackground(code) {

    }

};
