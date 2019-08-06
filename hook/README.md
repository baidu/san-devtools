# San-DevHook

Hook for San. Append a `__san_devtool__` namespace on global context contains
components and stores raw data.


## Usage

### Automatically
 
  - Add *autohook* in page URL: http://xxx/?autohook
  - Add *autohook* in script URL: `<script src="http://xxx/hook.js?autohook"></script>`

###  Programmatically
 
```
import {initHook} from '@ecomfe/san-devhook';

const config = {
    hookOnly: true,                                 // Do not send any message to content script (Only for extension).
    subKey: 'treeData',                             // Key for the array of sub component tree.
    prefixForBindingData: 'my',                     // Auto bing data and props using specified prefix.
    conditions: [{
        listeners: ['onAfterGenerateData', e => { }],
        event: eventName,
        target: targetDOM                           // All listeners will be disabled (do not execute) until the event
    }],                                             // binding on the target is triggered.
    onGenerateData: (
        message, cnode, parentId, component) => {}, // Append customized data for generating component tree.
    onAfterGenerateData: (message, cnode, parentId, component) => {},
    onBeforeListenSan: () => {},                      // Do something before a San event.
    onSanMessage: (
        message, cnode, parentId, component) => {}, // Procedure when a San event triggering.
    onAfterListenSan: () => {},                       // Procedure after a San event.
    onBeforeListenStore: () => {},                    // Procedure before a san-store event.
    onStoreMessage: () => {},                       // Procedure when a san-store event triggering.
    onAfterListenStore: () => {},                     // Procedure after a san-store event.
    onRetrieveData: tree => {},                     // Retrieve root CNode after calling retrieveData().
    onRootReady: (cnode, component) => {}           // Emit when root component is ready.
    onSan: sender => {}                             // Emit when San is initialized.
};

// The last argument called *config* is the configuration of san-devhook in all callbacks.

initHook(config);
```

### In Console
#### `__san_devtool__` namespace

  - san: A San object including version info, Component class etc.
  - _config: User configuration. Please see the section above.
  - initHook: initHook function. Please see the section above.
  - data: Whole component tree.
  - history: San event history.
  - store: Mutation records and stores for san-store.
  - routes: Route info for san-router.
  - getData(): Return `data` synchronously.
  - retrieveData(): Emit onRetrieveData.
  - showTree(): Display the component tree.

#### Objects binding on DOM

  - `__SAN_COMPONENT__`: The component instance of current DOM object.
  - `__SAN_DATA__`: The component data.
  - `__SAN_PROPS__`: The component props.
  - `__SAN_CNODE__`: A CNode instance of component acts as a serializable object.
  - `__SAN_PATH__`: Ancestor component ID list.
  - `showTree()`: Display the component tree under current DOM object.



More instructions refer to *docs* folder.

## Tests
### Run extension test
```
$ npm run chrome
```
And open a page using San.

### Run browser test
```
$ npm run browser
```
