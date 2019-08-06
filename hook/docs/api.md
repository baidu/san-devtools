# San-DevHook API Docs


## `__san_devtool__` namespace

### Properties

#### _config (Object)

User configuration. Including

- ***hookOnly*** (*boolean*)
  Do not send any message to content script (Only for extension).
  - Default: ***true***
- ***subKey*** (*string*)
  Key for the array of sub component tree.
  - Default: ***'treeData'***
- ***_domChildrenKey*** (*string*)
  Key for the array of dom attached components.
  - Default: ***domChildren***
- ***prefixForBindingData*** (*string*)
  Auto bing data and props using specified prefix.
  - Default: ***''***
- ***conditions*** (*Array*)
  The triggers for listeners, the specified listeners will be triggered when conditions are met. All listeners will be disabled (do not execute) until the event binding on the target is triggered.
  The structor of condition:
  
  ```
  {
    listeners: ['onAfterGenerateData', e => { }],  // built-in listener's name string or customized function
    event: 'eventName',  // a standard DOM event or customized event
    target: targetDOM    // a target DOM object for dispatch the event
  }
  ```
  - Default: ***[]***
- ***onGenerateData*** (*Function*)
  Append customized data for generating component tree.
  - Default: `(message, cnode, parentId, component, config) => {}`
- ***onAfterGenerateData*** (*Function*)
  After the data which is generated.
  - Default: `(message, cnode, parentId, component, config) => {}`
- ***onBeforeListenSan*** (*Function*)
  Procedure before a San event.
  - Default: `config => {}`
- ***onSanMessage*** (*Function*)
  Procedure when a San event triggering.
  - Default: `(message, cnode, parentId, component, config) => {}`
- ***onAfterListenSan*** (*Function*)
  Procedure after a San event.
  - Default: `config => {}`
- ***onBeforeListenStore*** (*Function*)
  Procedure before a san-store event.
  - Default: `config => {}`
- ***onStoreMessage*** (*Function*)
  Procedure when a san-store event triggering.
  - Default: `config => {}`
- ***onAfterListenStore*** (*Function*)
  Procedure after a san-store event.
  - Default: `config => {}`
- ***onRetrieveData*** (*Function*)
  Retrieve root CNode after calling retrieveData().
  - Default: `tree => {}`
- ***onRootReady*** (*Function*)
  Emit when root component is ready.
  - Default: ` (cnode, component) => {}`
- ***onSan*** (*Function*)
  Emit when San is initialized. Sender will be **'san'** (San is just initialized) or **'initHook'** (San is initialized when san-devhook initializing).
  - Default: `sender => {}`

#### _constants (Object)
All constants will be used.
```
{
    SAN_EVENTS: {
        COMP_COMPILED,
        COMP_INITED,
        COMP_CREATED,
        COMP_ATTACHED,
        COMP_DETACHED,
        COMP_DISPOSED,
        COMP_UPDATED,
        COMP_ROUTE
    },
    STORE_EVENTS: {
        STORE_DEFAULT_INITED,
        STORE_CONNECTED,
        STORE_COMP_INITED,
        STORE_COMP_DISPOSED,
        STORE_LISTENED,
        STORE_UNLISTENED,
        STORE_DISPATCHED,
        STORE_ACTION_ADDED
    },
    SAN_PROPERTIES: {
        __3_COMP__,
        __3_PATH__,
        __3_DATA__,
        __3_PROPS__,
        __3_INDEX_LIST__,
        __3_CNODE__
    },
    TREE_DETAIL_TYPE = {
      NONE: 0,
      DOM: 1,
      DATA: 2,
      COMPONENT: 4
  },
  TREE_MODE = {
      NORMAL: 'NORMAL',
      GROUP: 'GROUP'
  }
}
```

#### san (Object)
A copy of san object, refer to https://github.com/baidu/san/blob/master/src/main.js.

#### data (Object)
The whole component tree of current page, including a set of CNode (serialized San component) instance. The structor is

 - root
    * treeData (by config.subKey)
      * CNode
        - treeData
          - CNode
          - CNode
      * CNode

#### history (Array)
History log for all San listeners.

#### routes (Array)
Routes history.

#### store (Object)
Record all mutations when using *san-store*. Including all stores (only one by default), action list and mutation object (payload, diff etc.)

### Methods

#### showTree(options)
 
  - ***options.node*** (*Object*) Root node to display, can be a CNode, a San component or a DOM object.
    - Default: `__san_devtool__.data` 
  - ***options.primary*** (*string*) Primary text, like **primary (secondary)**.
    - Default: `'id'`
  - ***options.secondary*** (*string*) Secondary text, like **primary (secondary)**.
    - Default: `'name'`
  - ***options.detailType*** (*number*) The detail information to display, may include San component, DOM object, component data. Bind on `__san_devtool__._constants`.
    - Default: `DETAIL_TYPE.DOM`
  - ***options.highlight*** (*string*) Highlight in primary and secondary texts.
    - Default: `''`
  - ***options.style*** (*string*) Customize css style text for highlighting.
    - Default: `'color: white; background-color: black'`
  - ***options.mode*** (*string*) Normal mode or group mode, group mode will use **console.group()** to show the tree. Bind on `__san_devtool__._constants`.
    - Default: `TREE_MODE.NORMAL`

Display the component tree under the specified node with options.

#### retrieveData([indexList])

- No argument (*undefined*) Retrieve the whole component tree CNode data.
- ***indexList*** (*Array*) Retrieve CNode data under the specified path.
- ***index1***, [***index2***, ...] (*number*) Retrieve CNode data under the specified path.
Retrieve the node from the index list or the whole, and trigger `onRetrieveData` listener. 

#### getData()
Return a cloned whole component tree CNode data, same as `__san_devtool__.data`.

### Events

#### san
Fire when San is initialized, so ```san``` object will be bound on ```__san_devtool__```.

#### comp_compiled
#### comp_inited
#### comp_created
#### comp_attached
#### comp_updated
#### comp_detached
#### comp_disposed
Refer to https://baidu.github.io/san/tutorial/component/#%E7%94%9F%E5%91%BD%E5%91%A8%E6%9C%9F.

#### comp_route
Fire when routing.