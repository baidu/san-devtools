ChangeLog
========
3.1.5
-------
 - [Bugfix]
    - Fix incorrect number of components.
    - Fix incoreect layout of the san-devtools pannel(chrome extensions) in some special scenes.

1.1.4
-------
 - [Bugfix]
    - Fix conflict with Lodash between host page and injected scripts.
 - [Add]
    - Show error messages when the component tree has building errors.


1.1.3
-------
 - [Bugfix]
   - Opaque background for dark theme devtools.
   - Compatible with the latest San version (3.1.5 ~ latest).
   - Fix data updater in component data viewer.


1.1.0
-------
 - [Add]
   - Store panel for inspecting san-store.
   - Date viewer can be readonly.
 - [Update]
   - Optimize and asynchronize component tree.
   - Auto reload when navigating.

1.0.0-rc.6
-------
 - [Add]
   - Data viewer can update the data of the component.
   - Welcome page and title bar for component panel.
   - A filter for component panel, can filter keyword in component data (key or value), messages, computed, etc.
 - [Bugfix]
   - Fix window.postMessage data error when navigating.
 - [Update]
   - Enhance component tree's filter.
 - [Remove]
   - Highlight of component tree filter.
   - Unnessessary lines in base information.

1.0.0-rc.5
-------
[Add] Show Routes channel and the relative component in component tree when using san-router.

[Add] Options

[Remove] Blinking version number

[Bugfix]
  - Version detector error
  - Component tree refresh error
  - Load entry synchronously to fix ```__san_devtool__``` no data error

1.0.0-rc.3
-------
[Add] A global san-devtool cli

[Update] Deps: chrome-ext-messenger, san, san-mui

[Remove] Useless files

1.0.0-rc.1
-------
[Initial] First RC of devtool
  - version detection
  - component channel
    - component tree view
    - base information panel
    - data view panel
    - computed, filters, messages and listeners panels
  - history channel
    - simple san event history list
    - simple recording
