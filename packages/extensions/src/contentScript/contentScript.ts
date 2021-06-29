/* global __DEBUG__ */
/**
 * @file 打开 san 页面执行
 */
import injector from '../../utils/injector';
import {relay} from './relay';

if (__DEBUG__) {
    console.log('content_script');
}

chrome.runtime && injector.fromExtensionUrlSync(chrome.runtime.getURL('js/san_devtools_backend.js'));
relay();
