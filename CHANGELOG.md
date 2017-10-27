ChangeLog
========

1.0.0-rc.6
-------
 - [Add]
   - Data viewer can update the data of the component.
   - Welcome page and title bar for component panel.
   - A filter for component panel, can filter keyword in component data (key or value), messages, computed, etc.
 - [BUGFIX]
   - Fix window.postMessage data error when navigating.
 - [UPDATE]
   - Enhance component tree's filter.
 - [REMOVE]
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
