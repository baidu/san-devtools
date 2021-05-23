const {nanoid} = require('nanoid');
const ejs = require('ejs');
const {logger} = require('../utils');
const {createBackendjsUrl} = require('../utils');
const {SAN_DEVTOOLS_HTML} = require('../constants');

module.exports = tplpath => {
    return (req, res, next) => {
        if (req.origFilePath !== '/' && req.origFilePath !== '/getHomeConfigOnly') {
            logger.debug('home middleware out');
            next();
            return;
        }
        let getConfigOnly = false;
        if (req.origFilePath === '/getHomeConfigOnly') {
            getConfigOnly = true;
        }
        const {address, port} = req;
        const sessionId = nanoid();
        const frontendUrl = `http://${address}:${port}/${SAN_DEVTOOLS_HTML}`;
        const backends = req
            .getWebSocketServer()
            .getChannelManager()
            .getBackends()
            .reverse()
            .map(a => {
                const rs = {...a};
                delete rs.channel;
                // 去掉对象
                Object.keys(rs).forEach(k => {
                    if (typeof rs[k] === 'function') {
                        delete rs[k];
                    }
                });
                return rs;
            });
        const config = JSON.stringify({
            backendjs: createBackendjsUrl(address, port),
            wsPort: port,
            wsHost: address,
            frontendUrl,
            backends: backends,
            sessionId
        });

        if (getConfigOnly) {
            res.write(config, 'utf8');
            res.end();
        } else {
            ejs.renderFile(tplpath, {config}, {}, function (err, str) {
                if (err) {
                    logger.error('Home middleware: render template error:');
                    logger.error(err);
                    logger.error('  -> With data:');
                    logger.error(config);
                    next(err);
                    return;
                }
                res.write(str, 'utf8');
                res.end();
            });
        }
    };
};
