export {};
declare global {
    interface Window {
        logger: { [index: string]: Function };
    }
}