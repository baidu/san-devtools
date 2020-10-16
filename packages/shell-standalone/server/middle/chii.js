const fs = require('fs');
const path = require('path');
const {CHII_FRONTEND_PATH} = require('../constants');
const staticMiddleware = require('./static');
const {logger} = require('../utils');

const staticServer = staticMiddleware(CHII_FRONTEND_PATH, {
    getAbsolutePath
});
const rewritePath = path.join(__dirname, '../rewrite');
const replactStaticServer = staticMiddleware(rewritePath, {
    getAbsolutePath(filepath) {
        return path.join(rewritePath, filepath.replace('/chii/', '/'));
    }
});

module.exports = () => {
    return (req, res, next) => {
        const filepath = req.origFilePath;
        if (!filepath.startsWith('/chii/')) {
            logger.debug('chii middleware out');
            next();
            return;
        }
        const absoluteFilePath = path.join(rewritePath, filepath.replace('/chii/', '/'));
        // http://127.0.0.1:8899/chii/sdk/Connections.js
        fs.stat(absoluteFilePath, (err, stats) => {
            if (!err && stats) {
                // 存在就替换掉
                replactStaticServer(req, res, next);
            } else {
                // chii_app.html特殊处理？？？
                staticServer(req, res, next);
            }
        });
    };
};
function getAbsolutePath(filepath) {
    return path.join(CHII_FRONTEND_PATH, filepath.replace('/chii/', '/'));
}
