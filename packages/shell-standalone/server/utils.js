const fs = require('fs');
const log = require('webpack-log');
const chalk = require('chalk');

const onFinished = require('on-finished');
const destroy = require('destroy');

const {BACKENDJS_PATH, SAN_DEVTOOLS_HTML} = require('./constants');
const logger = log({
    name: 'SanDevtools',
    level: process.env.DEBUG ? 'debug' : 'info'
});
exports.logger = logger;

exports.truncate = function truncate(txt, width = 10) {
    if (!txt) {
        return '';
    }
    const ellipsis = '...';
    const len = txt.length;
    if (width > len) {
        return txt;
    }
    let end = width - ellipsis.length;
    if (end < 1) {
        return ellipsis;
    }
    return txt.slice(0, end) + ellipsis;
};
function getColorfulName(role) {
    role = role.toUpperCase();
    switch (role) {
        case 'FRONTEND':
            return chalk.blue(role);
        case 'BACKEND':
            // 为了对齐
            return chalk.yellow('BACK_END');
        case 'HOME':
            return chalk.magenta(role);
        case 'GET':
            return chalk.green(role);
    }
    return chalk.cyan(role);
}
exports.getColorfulName = getColorfulName;

exports.createBackendjsUrl = (address, port) => {
    return `http://${address}:${port}${BACKENDJS_PATH}`;
};
exports.createFrontendUrl = (address, port) => {
    // 注意，这里是&，不是?链接！！
    return `http://${address}:${port}/${SAN_DEVTOOLS_HTML}&ws&wsHost=${address}&wsPort=${port}`;
};

exports.sendFileStreamToResponse = function sendFileStreamToResponse(absoluteFilePath, response, next) {
    let finished = false;
    const stream = fs.createReadStream(absoluteFilePath, {start: 0});
    stream.pipe(response);
    // response finished, done with the fd
    onFinished(response, function onfinished() {
        logger.debug(`${getColorfulName('GET')} ${chalk.green('200')} ${absoluteFilePath}`);
        finished = true;
        destroy(stream);
    });
    // error
    stream.on('error', function onerror(err) {
        if (finished) {
            return;
        }
        finished = true;
        destroy(stream);
        logger.error(`${getColorfulName('GET')} ${chalk.red('500')} ${absoluteFilePath}`);
        next(err);
        return;
    });
};
