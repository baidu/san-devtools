/* global SAN_DEVTOOL */

/**
 * @file 用于插件注入代码
 */

function generateCodeString(codeArg: string | Function, thisArg: string, mountingKey?: string) {
    let code = '';

    if (mountingKey) {
        code = `window['${SAN_DEVTOOL}']['${mountingKey}']=${codeArg}`;
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

function inject(codeString: string) {
    if (!codeString) {
        return null;
    }
    const script: HTMLScriptElement = document.createElement('script');
    script.textContent = codeString;
    if (document.documentElement && script) {
        document.documentElement.appendChild(script);
        script.parentElement && script.parentElement.removeChild(script);
    }
    return script;
}

function injectUrl(url: string) {
    return new Promise(function (resolve, reject) {
        const script = document.createElement('script');
        script.src = url;
        script.onload = resolve;
        script.onerror = reject;
        if (document.documentElement && script) {
            document.documentElement.appendChild(script);
            script.parentElement && script.parentElement.removeChild(script);
        }
    });
}

function injectUrlSync(url: string = '') {
    let request = new XMLHttpRequest();
    request.open('GET', url, false);
    request.send(null);
    let code: string = '';
    if (request.status === 200) {
        code = request.responseText;
    }
    const script: HTMLScriptElement = document.createElement('script');
    if (document.documentElement && script) {
        script.textContent = code;
        document.documentElement.appendChild(script);
        script.parentElement && script.parentElement.removeChild(script);
    }
    return script;
}

export default {
    // Must be run in content script context.
    fromContentScript(codeArg: string | Function, thisArg: string, mountingKey?: string) {
        inject(generateCodeString(codeArg, thisArg, mountingKey));
    },

    fromExtensionUrl(url: string) {
        return injectUrl(url);
    },

    fromExtensionUrlSync(url: string) {
        return injectUrlSync(url);
    }
};
