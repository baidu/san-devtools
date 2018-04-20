# San-DevHook

Hook for San-DevTool. Append __san_devtool__ namespace on global which contains
components and stores raw data.


## Entries

 - Browser context
  - External script
  - Module
 - Extension context
  - For San-DevTool


## Usage

 - Automatically
  - Add *autohook* in page URL: http://xxx/?autohook
  - Add *autohook* in script URL: `<script src="http://xxx/hook.js?autohook"></script>`
 - Programmatically
  - ```
import {initHook} from 'san-devhook';

initHook(config);
```
 - Run extension test
  - ```
npm run chrome_ext
```

