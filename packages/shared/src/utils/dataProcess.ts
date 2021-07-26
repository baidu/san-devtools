/**
 * @file
 */
function toKey(value: any) {
    if (typeof value === 'string') {
        return value;
    }
    let result = value + '';
    return (result === '0' && (1 / value) === -1 / 0) ? '-0' : result;
}

export function getValueByPath(obj: Record<string, any>, path: string[] | string, defaultValue?: any) {
    if (typeof path === 'string') {
        path = path.split('.');
    }
    if (!Array.isArray(path) || obj == null) {
        return defaultValue;
    }

    let index = 0;
    const length = path.length;

    while (obj !== null && index < length) {
        obj = obj[toKey(path[index++])];
    }

    let result = (index && index === length) ? obj : undefined;
    return result === undefined ? defaultValue : result;
}
