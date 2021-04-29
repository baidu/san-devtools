const os = require('os');
const http = require('http');
const https = require('https');
const path = require('path');
const url = require('url');
const fs = require('fs');

const parseURL = url.parse;

const killable = require('killable');
const mime = require('mime');

const WebSocketServer = require('./lib/WebSocketServer');
const {logger} = require('./utils');
const magicBackend = require('./middle/magicBackend');
const homeMiddleware = require('./middle/home');
const staticMiddleware = require('./middle/static');
const chiiMiddleware = require('./middle/chii');
const aliveMiddleware = require('./middle/alive');
const getCertificate = require('./getCertificate');

const STATUS_READY = 'ready';
const STATUS_INITIAL = 'pending';

module.exports = class Server {
    constructor(options) {
        this._middlewares = [];
        /**
         * root
         * host
         * port
         */
        this.options = options;
        this.root = options.root || process.cwd();

        this.status = STATUS_INITIAL;
        this.hostname = options.hostname;
        this.port = options.port;
        logger.debug('Server options: ', {
            root: this.root,
            port: this.port,
            hostname: this.hostname
        });
        // 添加中间件
        this.use(magicBackend(this.root));
        this.use(homeMiddleware(path.join(this.root, 'home.ejs')));
        this.use(chiiMiddleware());
        this.use(aliveMiddleware());
        this.use(staticMiddleware(this.root));

        this.setupHttps();
        this.createServer();
        killable(this._server);
    }
    setupHttps() {
        if (this.options.https) {
            for (const property of ['ca', 'pfx', 'key', 'cert']) {
                const value = this.options.https[property];
                const isBuffer = value instanceof Buffer;

                if (value && !isBuffer) {
                    let stats = null;

                    try {
                        stats = fs.lstatSync(fs.realpathSync(value)).isFile();
                    } catch (error) {
                        // ignore error
                    }

                    // It is file
                    this.options.https[property] = stats ? fs.readFileSync(path.resolve(value)) : value;
                }
            }

            let fakeCert;

            if (!this.options.https.key || !this.options.https.cert) {
                fakeCert = getCertificate(logger);
            }

            this.options.https.key = this.options.https.key || fakeCert;
            this.options.https.cert = this.options.https.cert || fakeCert;
        }
    }
    createServer() {
        if (this._server) {
            // 保证执行一次
            return;
        }

        const app = (req, res) => {
            this._wrapRequest(req);
            this._wrapResponse(res);
            // response.sendResponse(500, '500 - Internal Server Error');
            this._requestHandler(req, res, err => {
                if (err.status === 404) {
                    res.sendResponse(404, '404 - File not found');
                    return;
                }
                logger.error(err);
                res.sendResponse(500, '500 - Internal Server Error');
            });
        };
        if (this.options.https) {
            this._server = https.createServer(this.options.https, app);
        } else {
            this._server = http.createServer(app);
        }

        this._server.on('error', err => {
            logger.error(err);
        });
    }
    listen(port = 8899, hostname = '0.0.0.0', fn) {
        this.hostname = hostname;
        this.port = port;

        return this._server.listen(port, hostname, err => {
            this.createSocketServer();

            if (typeof fn === 'function') {
                fn.call(this._server, err);
            }
            this.status = STATUS_READY;
        });
    }
    getUrl(pathname = '/', query = '') {
        return url.format({
            hostname: this.getAddress(),
            protocol: this.options.https ? 'https://' : 'http:',
            port: this.port,
            pathname: pathname,
            query: query
        });
    }
    getAddress() {
        if (this._realHost) {
            return this._realHost;
        }
        if (this.hostname !== '0.0.0.0' && this.hostname !== '127.0.0.1' && this.hostname !== 'localhost') {
            this._realHost = this.hostname;
            return this._realHost;
        }
        const ifaces = os.networkInterfaces();
        const keys = Object.keys(ifaces);
        for (let i = 0; i < keys.length; i++) {
            const dev = ifaces[keys[i]];
            for (let j = 0; j < dev.length; j++) {
                const details = dev[j];
                if (details.family === 'IPv4' && details.address !== '0.0.0.0' && details.address !== '127.0.0.1') {
                    this._realHost = details.address;
                    return this._realHost;
                }
            }
        }
        return this.hostname;
    }
    _requestHandler(req, res, errorHandler) {
        let idx = 0;
        const middlewares = this._middlewares;
        if (middlewares.length === 0) {
            return errorHandler({status: 404});
        }
        const firstHandler = middlewares[idx];
        run(firstHandler);

        function next(err) {
            if (err) {
                // 错误处理
                return errorHandler(err);
            }
            idx++;
            if (idx < middlewares.length) {
                run(middlewares[idx]);
            } else {
                errorHandler(err);
            }
        }

        function run(fn) {
            try {
                fn(req, res, next);
            } catch (err) {
                next(err);
            }
        }
    }
    _wrapRequest(req) {
        const parsedUrl = parseURL(req.url, true);
        req.parsedUrl = parsedUrl;
        req.query = parsedUrl.query;

        req.address = this.getAddress();
        req.port = this.port;

        let filePath = unescape(parsedUrl.pathname);
        req.origFilePath = filePath;
        req.getWebSocketServer = () => {
            return this._wsServer;
        };
    }
    _wrapResponse(res) {
        // 设置通用header
        // 跨域
        res.setHeader('Access-Control-Allow-Origin', '*');
        res.setHeader('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
        // eslint-disable-next-line
        res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
        res.setContentTypeHeaderByFilepath = file => {
            const header = 'Content-Type';
            if (res.getHeader(header)) {
                // 存在就return
                return;
            }
            const type = mime.lookup(file);
            if (type) {
                const charset = mime.charsets.lookup(type);
                res.setHeader(header, type + (charset ? '; charset=' + charset : ''));
            }
        };
        res.sendResponse = function sendResponse(statusCode, text) {
            res.writeHead(statusCode);
            res.write(text, 'utf8');
            res.end();
        };
    }
    use(fn) {
        const stack = this._middlewares;

        if (Array.isArray(fn)) {
            fn.forEach(add);
        } else if (typeof fn === 'function') {
            add(fn);
        }
        function add(f) {
            stack.push(f);
        }
    }
    createSocketServer() {
        if (this._wsServer) {
            return;
        }
        const wss = new WebSocketServer(logger);
        this._wsServer = wss;
        wss.init(this._server);
    }
    close() {
        this._wsServer.destory();
        this._server.kill();
    }
};
