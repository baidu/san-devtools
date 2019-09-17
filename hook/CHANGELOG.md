ChangeLog
=========


0.1.18
-------
 - [BUGFIX]
   - Do not install __san_devtool__ on window's __proto__.


0.1.17
-------
 - [BUGFIX]
   - Compatible with the latest San version (3.1.5 ~ latest).


0.1.16
-------
 - [BUGFIX]
   - Fix serialized CNode.getParent() bug.


0.1.15
-------
 - [BUGFIX]
   - Fix flattenChildren function.
 - [ADD]
   - CNode api docs.


0.1.13
-------
 - [BUGFIX]
   - Fix DOM attached bug.


0.1.11
-------
 - [ADD]
   - More options of showTree() function. And bind to DOM object.


0.1.10
-------
 - [BUGFIX]
   - Speed up serialize() function.


0.1.9
-------
 - [ADD]
   - showTree() function to display component tree in browser's console.
   - __SAN_PROPS__ binded to DOM object.


0.1.8
-------
 - [BUGFIX]
   - Recalculate index list for attaching or detaching component programmatically.
   - Fix onRetrieveData listener.
 - [ADD]
   - The prev and next functions for CNode.
   - The retrieveData function to retrieve any level of component tree.


0.1.7
-------
 - [BUGFIX]
   - _getComponent().parent is wrong.
   - CNode merges wrong data.


0.1.6
-------
 - [ADD]
   - Can register some conditions to disable sending events.
   - Append a `data_san-id` property on DOM object of component.


0.1.4
-------
 - [ADD]
   - onRootReady listener for notifying when root component is ready.


0.1.3
-------
 - [ADD]
   - getData() and retrieveData() function.
- [BUFGIX]
   - Fix the bug that CNode's ancestorIndexList may be -1.


0.1.2
-------
 - [ADD]
   - A `onRetrieveRoot` listener.


0.1.1
-------
 - [ADD]
   - A `fake` property for fake CNode.
 - [BUFGIX]
   - Fix wrong Component constructor name bug after compressing.


0.1.0
-------
 - [ADD]
   - parentId in listeners.
   - parentId in CNode instance.
   - template and parent's template in CNode instance.
 - [CHANGE]
   - Listeners' name in configuration.
 - [BUGFIX]
   - Fix circular structure in some listeners.
   - Update all children's ancestor index list when inserting or removing node.
   - Root CNode has a corrent index.


0.0.7
-------
 - [ADD]
   - Props in CNode.
 - [REMOVE]
   - All extension code.
   - `__SAN_INFO__` property.


0.0.6
-------
 - [ADD]
   - CNode class for component tree in `__san_devtool__`.
   - New San listener.
   - Customized key for component tree.


0.0.4
-------
 - [ADD]
   - Export initHook function for `__san_devtool__`.
   - A browser test.


0.0.3
-------
 - [BUGFIX]
   - Fix config error.


0.0.2
-------
 - [Add]
   - New entry.
   - Config.


0.0.1
-------
 - [Add]
   - `__san_devtool__` is consistent with ***San-DevTool 1.1.0***.
   - Hook automatically and programmatically.
   - A Chrome extension test.
