declare module 'circular-json-es6' {
    export function parse(text: string, reviver?: (key: any, value: any) => any): any;
    export function stringify(
        value: any,
        replacer?: ((key: string, value: any) => any) | Array<number | string> | null,
        space?: any
    ): string;
    export function stringifyStrict(
        value: any,
        replacer?: ((key: string, value: any) => any) | Array<number | string> | null,
        space?: any
    ): string;
}
