const fs = require('fs');
const path = require('path');

const {logger} = require('../utils');
const {BACKENDJS_PATH, BACKEND_JS_FILE} = require('../constants');
const {createFrontendUrl, sendFileStreamToResponse} = require('../utils');

module.exports = rootFolder => {
    return (req, res, next) => {
        if (BACKENDJS_PATH !== req.origFilePath) {
            logger.debug('magic backend middleware out');

            next();
            return;
        }
        const address = req.address;
        const port = req.port;
        // 提前发送backend sockpath代码
        // 这样的方式可以保证cli的参数跟backend.js的sockpath保持一致
        const magicCode = `!function(g){g.__san_devtool_ws_query__="?${createFrontendUrl(address, port)}";}(this);\n`;
        const absoluteFilePath = path.join(rootFolder, BACKEND_JS_FILE);

        fs.stat(absoluteFilePath, err => {
            if (!err) {
                res.setContentTypeHeaderByFilepath(absoluteFilePath);
                // 添加一段
                res.write(magicCode);
                sendFileStreamToResponse(absoluteFilePath, res, next);
            } else {
                const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
                if (notfound.includes(err.code)) {
                    err.status = 404;
                } else {
                    err.status = 500;
                }
                next(err);
            }
        });
    };
};
