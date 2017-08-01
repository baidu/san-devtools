/**
 * San DevTools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Utils
 */

export default {

    normalizeVersionNumber(version) {
        let reg = /^\d+(\.\d+)+(\-\b\w*\b)?$/;
        if (!version || typeof version !== 'string') {
            return null;
        }
        if (!reg.test(version)) {
            return '';
        }
        return version;
    }

};
