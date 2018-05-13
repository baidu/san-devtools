# San-DevHook

Hook for San-DevTool. Append a `__san_devtool__` namespace on global context which
contains components and stores raw data.


## Entries

 * Browser context
   - External script
   - Module
 * Extension context
   - For San-DevTool


## Usage

### Automatically
 
  - Add *autohook* in page URL: http://xxx/?autohook
  - Add *autohook* in script URL: `<script src="http://xxx/hook.js?autohook"></script>`

###  Programmatically
 
```
import {initHook} from '@ecomfe/san-devhook';

const config = {
    hookOnly: false,                                // Do not send any message to content script (Only for extension).
    subKey: 'treeData',                             // Key for the array of sub component tree.
    treeDataGenerator: (message, component) => {},  // Append customized data for generating component tree.
    beforeSanEventListener: () => {},               // Do something before a San event.
    onSanMessage: (message, component) => {},       // Do something when a San event triggering.
    afterSanEventListener: () => {},                // Do something after a San event.
    beforeStoreEventListener: () => {},             // Do something before a san-store event.
    onStoreMessage: () => {},                       // Do something when a san-store event triggering.
    afterStoreEventListener: () => {}               // Do something after a san-store event.
};

// The last argument called *config* is the configuration of san-devhook in all listeners.

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

#### Objects binding on DOM

  - `__SAN_COMPONENT__`: The component instance of current DOM object.
  - `__SAN_DATA__`: The component data.
  - `__SAN_CNODE__`: A CNode instance of component acts as a serializable object.
  - `__SAN_PATH__`: Ancestor component ID list.

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
