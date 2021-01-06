
export function getBridgeMessageNameByHookName(name: string) {
    // store-default-inited -> store:default-inited
    // comp-updated' -> comp:updated
    return name.replace(/^(\w+)-/, '$1:');
}
