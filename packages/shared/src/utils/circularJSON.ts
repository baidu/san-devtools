/**
 * @file handle circular json, Serialize and Deserialization
 */
// TODO: 这里只是简单的处理了一下，需要紧急完善一下，参考 vue 以及 circular-json
import {parse as circularParse, stringify as circularStringify} from 'circular-json';
const CircularJSON = {
    parse,
    stringify
};

function isSanComponent(comp: any) {
    let proto = Object.getPrototypeOf(comp);
    if (proto.constructor.name === 'ComponentClass' && 'aNode' in proto) {
        return true;
    }
    return false;
}

function replacer(key: string, value: any) {
    let protoType = Object.prototype.toString.call(value);
    if (protoType === '[object Object]' && isSanComponent(value)) {
        return `[ComponentClass-ID:${value.id}]`;
    }
    return value;
}

function parse(value: any) {
    return circularParse(value);
}

function stringify(value: any) {
    return circularStringify(value, replacer);
}

export default CircularJSON;