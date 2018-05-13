/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Constants
 * @author luyuan<luyuan.china@gmail.com>
 */


export const COMP_COMPILED = 'comp-compiled';
export const COMP_INITED = 'comp-inited';
export const COMP_CREATED = 'comp-created';
export const COMP_ATTACHED = 'comp-attached';
export const COMP_DETACHED = 'comp-detached';
export const COMP_DISPOSED = 'comp-disposed';
export const COMP_UPDATED = 'comp-updated';
export const COMP_ROUTE = 'comp-route';

export const SAN_EVENTS = [
    COMP_COMPILED,
    COMP_INITED,
    COMP_CREATED,
    COMP_ATTACHED,
    COMP_DETACHED,
    COMP_DISPOSED,
    COMP_UPDATED,
    COMP_ROUTE
];

export const STORE_DEFAULT_INITED = 'store-default-inited';
export const STORE_CONNECTED = 'store-connected';
export const STORE_COMP_INITED = 'store-comp-inited';
export const STORE_COMP_DISPOSED = 'store-comp-disposed';
export const STORE_LISTENED = 'store-listened';
export const STORE_UNLISTENED = 'store-unlistened';
export const STORE_DISPATCHED = 'store-dispatched';
export const STORE_ACTION_ADDED = 'store-action-added';

export const STORE_EVENTS = [
    STORE_DEFAULT_INITED,
    STORE_CONNECTED,
    STORE_COMP_INITED,
    STORE_COMP_DISPOSED,
    STORE_LISTENED,
    STORE_UNLISTENED,
    STORE_DISPATCHED,
    STORE_ACTION_ADDED
];

export const SUB_KEY = 'treeData';

export const NOOP = () => {};

export const __3_COMP__ = '__SAN_COMPONENT__';
export const __3_PATH__ = '__SAN_PATH__';
export const __3_DATA__ = '__SAN_DATA__';
export const __3_TREE_INDEX__ = '__SAN_TREE_INDEX__';
export const __3_INFO__ = '__SAN_INFO__';
export const __3_CNODE__ = '__SAN_CNODE__';

export const SAN_PROPERTIES = [
    __3_COMP__,
    __3_PATH__,
    __3_DATA__,
    __3_TREE_INDEX__,
    __3_INFO__,
    __3_CNODE__
];

export const INVALID = -1;

export const COMP_CONSTRUCTOR_NAME = 'ComponentClass';
