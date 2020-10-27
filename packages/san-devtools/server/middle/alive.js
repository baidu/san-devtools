const {logger} = require('../utils');
module.exports = () => {
    return (req, res, next) => {
        const filepath = req.origFilePath;
        if (!filepath.startsWith('/alive/')) {
            logger.debug('alive middleware out');

            next();
            return;
        }
        const [_, _1, backendId]  = filepath.split('/');
        if (backendId) {
            const backendChannel = req.getWebSocketServer().getChannelManager().getBackendById(backendId);
            if (backendChannel) {
                if (backendChannel.alive) {
                    res.end('1');
                    return;
                }
            }
            res.end('0');
        }
        else {

            res.end('-1');
        }
    };
};
