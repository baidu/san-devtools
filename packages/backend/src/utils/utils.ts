export function getBridgeMessageNameByHookName(name: string) {
    // store-default-inited -> store:default-inited
    // comp-updated' -> comp:updated
    return name.replace(/^(\w+)-/, '$1:');
}

function toKey(value: any) {
    if (typeof value === 'string') {
        return value;
    }
    let result = value + '';
    return (result === '0' && (1 / value) === -1 / 0) ? '-0' : result;
}

export function getValueByPath(obj: Record<string, any>, path: string[]) {
    if (!Array.isArray(path)) {
        return undefined;
    }

    let index = 0;
    const length = path.length;

    while (obj != null && index < length) {
        obj = obj[toKey(path[index++])];
    }
    return (index && index === length) ? obj : undefined;
}
