const url = require('url');
const querystring = require('querystring');

const WebSocket = require('ws');
const ChannelMultiplex = require('./ChannelMultiplex');
const {logger} = require('../utils');
const Manager = require('./Manager');

module.exports = class WebSocketServer {
    constructor() {
        this.channelManager = new ChannelMultiplex();
        this.manager = new Manager(this);

        const wss = (this._wss = new WebSocket.Server({noServer: true}));

        wss.on('connection', ws => {
            const {id, role} = ws;
            switch (role) {
                case 'backend':
                    this.channelManager.createBackendChannel(id, ws);
                    break;
                case 'frontend':
                    this.channelManager.createFrontendChannel(id, ws, ws.backend);
                    break;
                case 'home':
                    this.manager.createChannel(id, ws);
                    break;
            }
        });
    }
    destory() {
        this.channelManager.destory();
        this.manager.destroy();
    }
    getChannelManager() {
        return this.channelManager;
    }

    init(server) {
        const wss = this._wss;
        const socketPaths = ['backend', 'frontend', 'home', 'chii'];
        server.on('upgrade', function (request, socket, head) {
            const urlObj = url.parse(request.url);
            const [_, role, id, backendId] = urlObj.pathname.split('/');

            if (socketPaths.indexOf(role) !== -1) {
                wss.handleUpgrade(request, socket, head, ws => {
                    ws.role = role;
                    ws.id = id;
                    logger.debug('upgrade', role, id);

                    if (role === 'backend') {
                        const q = querystring.parse(urlObj.query);
                        // 来自 query的参数
                        ws.url = q.url;
                        ws.title = q.title;
                        ws.favicon = q.favicon;
                    }
                    else if (role === 'frontend') {
                        // 来自query的backendId
                        ws.backend = backendId;
                    }
                    wss.emit('connection', ws, request);
                });
            }
            else {
                socket.destroy();
            }
        });
    }
};
