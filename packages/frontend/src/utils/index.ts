/* global chrome */

export const optimizedResize = (function () {

    let callbacks: Function[] = [];
    let running = false;
    // fired on resize event
    function resize() {

        if (!running) {
            running = true;

            if (window.requestAnimationFrame) {
                window.requestAnimationFrame(runCallbacks);
            } else {
                setTimeout(runCallbacks, 66);
            }
        }

    }

    // run the actual callbacks
    function runCallbacks() {
        callbacks.forEach(function (callback) {
            callback();
        });
        running = false;
    }

    // adds callback to loop
    function addCallback(callback: Function) {
        if (callback) {
            callbacks.push(callback);
        }
    }

    return {
        // public method to add additional callback
        add: function (callback: Function) {
            if (!callbacks.length) {
                window.addEventListener('resize', resize);
            }
            addCallback(callback);
        }
    };
}());

export const versionCompare = (version1: any, version2: any) => {
    version1 = (version1 instanceof String || typeof version1 !== 'string') ? '' : version1.toString();
    version2 = (version2 instanceof String || typeof version2 !== 'string') ? '' : version2.toString();
    let a = version1.split('.');
    let b = version2.split('.');
    let i = 0;
    let len = Math.max(a.length, b.length);
    for (; i < len; i++) {
        if ((a[i] && !b[i] && parseInt(a[i], 10) > 0) || (parseInt(a[i], 10) > parseInt(b[i], 10))) {
            return 1;
        }
        else if ((b[i] && !a[i] && parseInt(b[i], 10) > 0) || (parseInt(a[i], 10) < parseInt(b[i], 10))) {
            return -1;
        }

    }
    return 0;
};

export const isChromePanel = !!(typeof chrome !== undefined && chrome && chrome.devtools);

export const SETTINGS: Record<string, any> = {
    'Setting:component': 0b000000000001,
    'Setting:store': 0b000000000010,
    'Setting:event': 0b000000000100,
    'Setting:messages': 0b000000001000
};

export function setSettings(settingData: string[]) {
    let settings = 0b000000000000;
    settingData.forEach((item: string) => {
        if (SETTINGS[item]) {
            settings |= SETTINGS[item];
        }
    });
    return settings;
}

export function getSettings(settingData: number) {
    let res: string[] = [];
    if (!settingData) {
        return res;
    }
    Object.entries(SETTINGS).forEach(([key, val]) => {
        if (+settingData & val) {
            res.push(key);
        }
    });
    return res;
}
