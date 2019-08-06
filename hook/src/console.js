/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Console functions
 * @author luyuan<luyuan.china@gmail.com>
 */


import {getDevtoolNS} from './utils';
import {TREE_DETAIL_TYPE, TREE_MODE, SAN_PROPERTIES} from './constants';


/* globals console */


const [
    __3_COMP__,
    __3_PATH__,
    __3_DATA__,
    __3_PROPS__,
    __3_INDEX_LIST__,
    __3_CNODE__
] = SAN_PROPERTIES;


const LINES = {
    length: 5,
    BLANK: '     ',
    NORMAL: '  │  ',
    HAS_CHILD: '  ├──',
    HAS_CHILD_AND_TAPER: '  ├──',
    LAST_HAS_CHILD: '  └──'
};

const DOUBLE_LINES = {
    length: 5,
    BLANK: '     ',
    NORMAL: '  ┃  ',
    HAS_CHILD: '  ┣━━',
    HAS_CHILD_AND_TAPER: '  ┡━━',
    LAST_HAS_CHILD: '  ┗━━'
};

const DOM_ATTACHED = 'DOM Attached';

export const HIGHLIGHT_STYLE = 'color: white; background-color: black';
export const DEFAULT_STYLE = 'color: black';
export const HIGHLIGHT_DOM_ATTACHED_STYLE = 'color: white; background-color: blue';
export const DOM_ATTACHED_STYLE = 'color: blue';

export const DEFAULT_CONSOLE_OPTIONS = {
    primary: 'id',
    secondary: 'name',
    detailType: TREE_DETAIL_TYPE.DOM,
    highlight: '',
    highlightStyle: HIGHLIGHT_STYLE,
    defaultStyle: DEFAULT_STYLE,
    highlightDOMAttachedStyle: '',
    domAttachedStyle: '',
    mode: TREE_MODE.NORMAL
};


function getRandomDarkColor() {
    let color = '#';
    for (let i = 0; i < 3; i++) {
        color += (Math.floor(Math.random() * 64) + 16).toString(16) + '';
    }
    return color;
}


function getRandomLightColor() {
    let color = '#';
    for (let i = 0; i < 3; i++) {
        color += (Math.floor(Math.random() * 64) + (256 - 64)).toString(16) + '';
    }
    return color;
}


export function getFunctionList(node) {
    if (!node || !node._getComponent || !node._getComponent()) {
        return;
    }
    const comp = node._getComponent();
    const el = comp.el;
    if (!el) {
        return;
    }
    const list = {'Function list': 1};
    Object.defineProperties(list, {
        'getDOM': {
            enumerable: true,
            get: () => wrap(console.log, el)
        },
        'getComponent': {
            enumerable: true,
            get: () => wrap(console.log, comp)
        },
        'getNode': {
            enumerable: true,
            get: () => wrap(console.log, node)
        },
        'getData': {
            enumerable: true,
            get: () => wrap(console.table, el[__3_DATA__])
        },
        'getProps': {
            enumerable: true,
            get: () => wrap(console.table, el[__3_PROPS__])
        },
        'getPath': {
            enumerable: true,
            get: () => wrap(console.table, el[__3_PATH__])
        }

    });
    return list;
}


function convertNode(varient) {
    if (varient instanceof window.HTMLElement || varient instanceof getDevtoolNS().san.Component) {
        return varient.__SAN_CNODE__;
    } else if (typeof varient === 'string') {
        return document.querySelector(`[data-san_id="${varient}"]`).__SAN_CNODE__;
    } else {
        return varient;
    }
}


function wrap(consoleFunc, ...args) {
    ((...args) => setTimeout(consoleFunc.bind(console, ...args))).apply(null, args);
    return args[0];
}


function getTree({node, primary, secondary, detailType} = DEFAULT_CONSOLE_OPTIONS) {
    let map = new Map();
    const getDetail = (node, detailType) => {
        let detail = [];
        Object.values(TREE_DETAIL_TYPE).forEach(t => {
            let object;
            switch (t) {
                case TREE_DETAIL_TYPE.COMPONENT: {
                    object = node._getComponent ? node._getComponent() : null;
                    break;
                }
                case TREE_DETAIL_TYPE.DOM: {
                    object = node._getComponent ? node._getComponent().el : null;
                    break;
                }
                case TREE_DETAIL_TYPE.DATA: {
                    object = node._getComponent
                        ? node._getComponent().data.raw || node._getComponent().data.data
                        : null;
                    break;
                }
                case TREE_DETAIL_TYPE.FUNCTION_LIST: {
                    object = getFunctionList(node);
                    break;
                }
                case TREE_DETAIL_TYPE.NONE:
                default: {
                    object = null;
                }
            }
            if (detailType & t && object) {
                detail.push(object);
            }
        });
        return detail.length === 0
            ? null
            : (detail.length === 1 && detailType & TREE_DETAIL_TYPE.FUNCTION_LIST ? detail[0] : detail);
    };

    const traverse = (root, tree) => {
        if (!root) {
            return;
        }
        let secondaryText = root[secondary] ? ` (${root[secondary]})` : '';
        let text = `${root[primary]}${secondaryText}`;
        tree.push(text);
        const detail = getDetail(root, detailType);
        map.set(text, detail);

        if (root.getDOMChildren && Array.isArray(root.getDOMChildren())) {
            tree.push([`${text} ${DOM_ATTACHED}`, []]);
            map.set(`${text} ${DOM_ATTACHED}`, detail);
            root.getDOMChildren().forEach(e => traverse(e, tree[tree.length - 1][1]));
        }
        if (root.getSubKey && Array.isArray(root.getSubKey())) {
            if (!Array.isArray(tree[tree.length - 1])) {
                tree.push([]);
            }
            root.getSubKey().forEach(e => traverse(e, tree[tree.length - 1]));
        }
    };

    let tree = [];
    traverse(convertNode(node), tree);
    return {tree, map};
}


function showTreeLog({
    node,
    highlight,
    primary,
    secondary,
    detailType,
    highlightStyle,
    defaultStyle,
    highlightDOMAttachedStyle,
    domAttachedStyle
} = DEFAULT_CONSOLE_OPTIONS) {
    const colorMap = new Map();
    const traverse = ({
        level = -1,
        isLast = true,
        line = [],
        domChildren: {
            isDOMAttached = false,
            isDOMRoot = false,
            rootTree = '',
            rootLevel = -1
        } = {},
        tree,
        highlight,
        highlightStyle,
        defaultStyle,
        highlightDOMAttachedStyle,
        domAttachedStyle
    } = {}) => {
        if (typeof tree === 'string' && tree.endsWith(DOM_ATTACHED)) {
            isDOMAttached = isDOMRoot = true;
            rootLevel = level;
        }

        if (level > 0) {
            isDOMAttached
                ? line.push(!isLast ? (level === rootLevel ? LINES.NORMAL : DOUBLE_LINES.NORMAL) : DOUBLE_LINES.BLANK)
                : line.push(!isLast ? LINES.NORMAL : LINES.BLANK);
        }

        if (Array.isArray(tree)) {
            tree.forEach((e, i, a) => {
                let hasDOMAttached = typeof a[i - 1] === 'string' && a[i - 1].endsWith(DOM_ATTACHED);
                traverse({
                    tree: e,
                    level: level + 1,
                    isLast: i === a.length - 2 && Array.isArray(a[a.length - 1]) || i === a.length - 1,
                    line: Object.assign([], line),
                    highlight,
                    highlightStyle,
                    defaultStyle,
                    highlightDOMAttachedStyle: highlightDOMAttachedStyle || '',
                    domAttachedStyle: domAttachedStyle || '',
                    domChildren: {
                        rootTree: isDOMAttached || hasDOMAttached ? e : rootTree,
                        rootLevel: hasDOMAttached && rootLevel === -1 ? level + 1 : rootLevel,
                        isDOMAttached: isDOMAttached || hasDOMAttached,
                        isDOMRoot
                    }
                });
            });
        } else {
            if (level > 0) {
                const lines = isDOMAttached ? DOUBLE_LINES : LINES;
                if (isLast) {
                    line[line.length - 1] = lines.LAST_HAS_CHILD;
                } else {
                    line[line.length - 1] = isDOMRoot ? lines.HAS_CHILD_AND_TAPER : lines. HAS_CHILD;
                }
            }

            const object = map.get(tree);
            treeLine.push(object ? `${line.join('')} %c${tree}%c %o` : `${line.join('')} %c${tree}%c`);

            if (isDOMAttached) {
                const darkColor = getRandomDarkColor();
                const lightColor = getRandomLightColor();
                if (!domAttachedStyle) {
                    domAttachedStyle = `background-color: ${lightColor}; color: ${darkColor}; font-weight: bold`;
                }
                if (!highlightDOMAttachedStyle) {
                    highlightDOMAttachedStyle = `color: white; background-color: ${darkColor}`;
                }
                colorMap.set(tree, {darkColor, lightColor});
            } else {
                const colors = colorMap.get(tree);
                if (colors) {
                    isDOMAttached = true;
                    if (!domAttachedStyle) {
                        domAttachedStyle
                            = `background-color: ${colors.lightColor}; color: ${colors.darkColor}; font-weight: bold`;
                    }
                    if (!highlightDOMAttachedStyle) {
                        highlightDOMAttachedStyle = `color: white; background-color: ${colors.darkColor}`;
                    }
                }
            }
            const arg = [
                highlight && tree.indexOf(highlight) >= 0
                    ? (isDOMAttached ? highlightDOMAttachedStyle : highlightStyle)
                    : (isDOMAttached ? domAttachedStyle : defaultStyle),
                defaultStyle
            ];
            object && arg.push(object);
            args.push(...arg);
        }
    };

    let treeLine = [];
    let args = [];
    const {tree, map} = getTree({node, primary, secondary, detailType});
    traverse({tree, highlight, highlightStyle, defaultStyle, highlightDOMAttachedStyle, domAttachedStyle});

    wrap(console.log, treeLine.join('\n'), ...args);
}


function showTreeGroup({
    node,
    highlight,
    primary,
    secondary,
    detailType,
    highlightStyle,
    defaultStyle,
    highlightDOMAttachedStyle,
    domAttachedStyle
} = DEFAULT_CONSOLE_OPTIONS) {
    const colorMap = new Map();
    const getText = (tree, parent) => Array.isArray(tree) && Array.isArray(parent)
        ? parent[parent.indexOf(tree) - 1]
        : tree;
    const find = (tree, parent) => highlight && getText(tree, parent).indexOf(highlight) >= 0;

    const traverse = ({
        isDOMAttached = false,
        parent = null,
        tree,
        highlight,
        highlightStyle,
        defaultStyle,
        highlightDAStyle,
        daStyle
    } = {}) => {
        let style = defaultStyle;
        let highlighted = false;
        let text = getText(tree, parent);

        if (typeof text === 'string' && text.endsWith(DOM_ATTACHED)) {
            isDOMAttached = true;
        }

        if (isDOMAttached && !colorMap.get(text)) {
            const darkColor = getRandomDarkColor();
            const lightColor = getRandomLightColor();
            colorMap.set(text, {darkColor, lightColor});
        }

        if (Array.isArray(tree)) {
            highlighted = find(tree, parent);
            if (parent) {
                const object = map.get(text);
                const colors = colorMap.get(text);
                if (colors) {
                    isDOMAttached = true;
                    if (!domAttachedStyle) {
                        daStyle
                            = `background-color: ${colors.lightColor}; color: ${colors.darkColor}; font-weight: bold`;
                    }
                    if (!highlightDOMAttachedStyle) {
                        highlightDAStyle = `color: white; background-color: ${colors.darkColor}`;
                    }
                }
                style = highlighted
                    ? (isDOMAttached ? highlightDAStyle : highlightStyle)
                    : (isDOMAttached ? daStyle : defaultStyle);
                object
                    ? wrap(console.group, `%c${text}%c %o`, style, defaultStyle, object)
                    : wrap(console.group, `%c${text}%c`, style, defaultStyle);
            }
            tree.forEach((e, i, a) => {
                traverse({
                    tree: e,
                    isDOMAttached: isDOMAttached || (typeof a[i - 1] === 'string' && a[i - 1].endsWith(DOM_ATTACHED)),
                    highlight,
                    highlightStyle, defaultStyle,
                    highlightDAStyle: highlightDOMAttachedStyle ? highlightDOMAttachedStyle : highlightDAStyle,
                    daStyle: domAttachedStyle ? domAttachedStyle : daStyle,
                    parent: tree
                });
            });
            if (parent) {
                wrap(console.groupEnd);
            }
        } else if (parent && !Array.isArray(parent[parent.indexOf(tree) + 1])) {
            const object = map.get(tree);
            highlighted = find(tree, parent);
            const colors = colorMap.get(tree);
            if (colors) {
                isDOMAttached = true;
                if (!domAttachedStyle) {
                    daStyle
                        = `background-color: ${colors.lightColor}; color: ${colors.darkColor}; font-weight: bold`;
                }
                if (!highlightDOMAttachedStyle) {
                    highlightDAStyle = `color: white; background-color: ${colors.darkColor}`;
                }
            }
            style = highlighted
                ? (isDOMAttached ? highlightDAStyle : highlightStyle)
                : (isDOMAttached ? daStyle : defaultStyle);
            object
                ? wrap(console.log, `%c${text}%c %o`, style, defaultStyle, object)
                : wrap(console.log, `%c${text}%c`, style, defaultStyle);
        }
    };

    let args = [];
    const {tree, map} = getTree({node, primary, secondary, detailType});

    traverse({
        tree, highlight, highlightStyle, defaultStyle,
        highlightDAStyle: highlightDOMAttachedStyle,
        daStyle: domAttachedStyle
    });
}


export function showTree(options = DEFAULT_CONSOLE_OPTIONS) {
    switch (options.mode) {
        case TREE_MODE.NORMAL: {
            showTreeLog(options);
            break;
        }
        case TREE_MODE.GROUP: {
            showTreeGroup(options);
            break;
        }
    }
    return '--------- Component tree ---------';
}
