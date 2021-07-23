import {toLocaleDatetime} from '@shared/utils/dateFormator';
import {getValueByPath} from '../../utils/utils';
import {IDiffItem} from './types';

/**
 * 获取 action 的『开始时间-结束时间』字符串
 * @param startTime 开始时间
 * @param endTime 结束时间
 */
export function getTimeRange(startTime: number | undefined, endTime: number | undefined) {
    let start = '';
    let end = '';
    if (startTime) {
        start = toLocaleDatetime(new Date(startTime), 'hhh:mm:ss');
    }
    if (endTime) {
        end = toLocaleDatetime(new Date(endTime), 'hhh:mm:ss');
    }
    return `${start}-${end}`;
}

/**
 * 获取此次 action 改变了哪些data
 * @param data
 * @param storeName store 名称
 * @return targetStr 改变的 store 的 key
 */
export function getChangedTarget(diffData: any) {
    let targetStr = '';
    if (!diffData || !Array.isArray(diffData)) {
        return targetStr;
    }
    diffData.reduce((pre, cur) => {
        let target = cur.target;
        if (target && Array.isArray(target)) {
            targetStr += target.join('.') + ';';
        }
    }, targetStr);
    return targetStr;
}

export function getStrFromObject(mapData: Record<string, any>) {
    if (Object.prototype.toString.call(mapData) === '[object Object]') {
        return Object.entries(mapData).map(item => {
            let value = '-';
            switch (typeof item[1]) {
                case 'string': {
                    value = item[1];
                    break;
                }
                case 'function' : {
                    value = item[1].name;
                }
                default: break;
            }
            return `${item[0]}: ${value},`;
        });
    }
    return;
}

/**
 * san-update
 * Copyright 2016 Baidu Inc. All rights reserved.
 *
 * @file parse property name
 * @author otakustay
 */

/* eslint-disable max-depth */
const LEFT_SQUARE_BRACKET = '['.charCodeAt(0);

export const parseName = (source: string) => {
    if (Array.isArray(source)) {
        return source;
    }

    // 这个简易的非状态机的实现是有缺陷的
    // 比如 a['dd.cc'].b 这种就有问题了，不过我们不考虑这种场景
    const terms = (source + '').split('.');
    const result = [];

    // eslint-disable-next-line
    for (let i = 0; i < terms.length; i++) {
        let term = terms[i];
        const propAccessorStart = term.indexOf('[');

        if (propAccessorStart >= 0) {
            if (propAccessorStart > 0) {
                result.push(term.slice(0, propAccessorStart));
                term = term.slice(propAccessorStart);
            }

            while (term.charCodeAt(0) === LEFT_SQUARE_BRACKET) {
                const propAccessorEnd = term.indexOf(']');
                if (propAccessorEnd < 0) {
                    throw new Error('Property path syntax error: ' + source);
                }

                const propAccessorLiteral = term.slice(1, propAccessorEnd);
                if (/^[0-9]+$/.test(propAccessorLiteral)) {
                    // for number
                    result.push(+propAccessorLiteral);
                } else if (/^(['"])([^\1]+)\1$/.test(propAccessorLiteral)) {
                    // for string literal
                    // eslint-disable-next-line no-new-func
                    result.push(new Function('return ' + propAccessorLiteral)());
                } else {
                    throw new Error('Property path syntax error: ' + source);
                }

                term = term.slice(propAccessorEnd + 1);
            }
        } else {
            result.push(term);
        }
    }

    return result;
};

/**
 * 生成 diff 数据
 * @param newValue
 * @param oldValue
 * @param mapStatesPaths mapStates 映射为 store.state 属性路径
 * @returns 返回 diff 数据
 */
export function getDiff(
    newValue: Record<string, any>,
    oldValue: Record<string, any>,
    mapStatesPaths: Record<string, any>
) {
    const diffs: IDiffItem[] = [];
    for (let stateName in mapStatesPaths) {
        if (mapStatesPaths.hasOwnProperty(stateName)) {
            const path = mapStatesPaths[stateName];
            const newData = getValueByPath(newValue, path);
            const oldData = getValueByPath(oldValue, path);
            let diff;
            if (oldData !== undefined && newData !== undefined && newData !== oldData) {
                diff = {
                    $change: 'change',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            } else if (oldData === undefined && newData !== undefined) {
                diff = {
                    $change: 'add',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            } else if (oldData !== undefined && newData === undefined) {
                diff = {
                    $change: 'remove',
                    newValue: newData,
                    oldValue: oldData,
                    target: path
                };
            }
            // eslint-disable-next-line
            diff && diffs.push(diff as IDiffItem);
        }
    }
    return diffs;
}
