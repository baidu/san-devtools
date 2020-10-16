const fs = require('fs');
const path = require('path');

const {logger, sendFileStreamToResponse} = require('../utils');

module.exports = (rootFolder, {headers = {}, maxage = 60 * 60 * 2 * 1e3, getAbsolutePath} = {}) => {
    return (req, res, next) => {
        logger.debug('static in');
        const filepath = req.origFilePath;
        let absoluteFilePath;
        // 获取实际地址
        if (typeof getAbsolutePath !== 'function') {
            getAbsolutePath = filepath => path.join(rootFolder, filepath);
        }
        const t = getAbsolutePath(filepath, req);
        if (typeof t === 'string' && t.length) {
            absoluteFilePath = t;
        }
        fs.stat(absoluteFilePath, (err, stats) => {
            if (!err) {
                // 设置缓存
                if (!res.getHeader('Last-Modified')) {
                    res.setHeader('Last-Modified', stats.mtime.toUTCString());
                }
                if (!res.getHeader('Cache-Control')) {
                    res.setHeader('Cache-Control', `max-age=${(maxage / 1000) | 0}`);
                }
                if (headers && typeof headers === 'object') {
                    Object.entries(headers).forEach(([header, value]) => {
                        res.setHeader(header, value);
                    });
                }
                res.setContentTypeHeaderByFilepath(absoluteFilePath);
                sendFileStreamToResponse(absoluteFilePath, res, next);
            } else {
                const notfound = ['ENOENT', 'ENAMETOOLONG', 'ENOTDIR'];
                if (notfound.includes(err.code)) {
                    err.status = 404;
                    next(err);
                } else {
                    err.status = 500;
                    next(err);
                }
            }
        });
    };
};
