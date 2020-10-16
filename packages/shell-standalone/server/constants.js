const path = require('path');
exports.BACKEND_JS_FILE = '/backend.js';

exports.CHII_FRONTEND_PATH = path.join(path.dirname(require.resolve('chii/package.json')), 'public/front_end');
// 这个需要跟webpack html filename对应上
exports.SAN_DEVTOOLS_HTML = 'san-devtools.html';

exports.BACKENDJS_PATH = '/ws-backend.js';
