/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Init hook.
 */


window.sanDevHook = {
    autohook: true,
    config: {
        subKey: 'sub',
        hookOnly: false,
        treeDataGenerator: (message, component, config) => {
            component.el.dataset.san_id = component.id;
            return {hello: 'world'};
        }
    }
};
