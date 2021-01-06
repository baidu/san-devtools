/**
 * @file 版本比较
 */
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
