/**
 * @file dom ready 方法
 * @module browser
 * @author ksky521 <ksky521@gmail.com>
 */

const fnList: Function[] = [];
let isReady = false;
function onReady() {
    fnList.forEach(fn => {
        fn();
    });
    fnList.length = 0;
    isReady = true;
}

export default function ready(fn: Function) {
    if (typeof fn !== 'function') {
        return;
    }

    if (isReady) {
        fn();
    }
    else {
        fnList.push(fn);
    }
}
if ('complete,loaded,interactive'.indexOf(document.readyState) > -1 && document.body) {
    onReady();
}
else {
    document.addEventListener('DOMContentLoaded', onReady, false);
}
