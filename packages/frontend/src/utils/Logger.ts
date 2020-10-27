/**
 * @file Loger: 开发模式下用于方便的输出信息
 */
type BasicType = number | string | boolean | undefined | null;
interface LoggerObj{
    [name: string]: (...content: BasicType[]) => void;
}

function createColorLogger(colors: string[], name?: string) {
    let LoggerName = name || 'logger';
    let LoggerObj = {};
    for (let color of colors) {
        (LoggerObj as LoggerObj)[color] = function (...content: BasicType[]): void {
            if (content.length === 0) {
                return;
            }
            let date = new Date();
            let time = [date.getHours(), date.getMinutes(), date.getSeconds(), date.getMilliseconds()].join(':');
            if (typeof content[0] === 'string') {
                content[0] = `%c[${time}] ${content[0]}`;
                content.splice(1, 0, `color: ${color}`);
            } else {
                content.unshift(`%c[${time}]`, `color: ${color}`);
            }
            console.log(...content);
        };
    }
    const Logger = Object.assign({}, LoggerObj, console);
    if (!(LoggerName in window)) {
        (window as any)[LoggerName] = Logger;
        return true;
    }
    return false;
}
export default function initLogger() {
    return createColorLogger(['red', 'green', 'blue'], 'logger');
}


