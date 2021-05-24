const EventEmitter = require('events').EventEmitter;
const chalk = require('chalk');

const {truncate, logger, getColorfulName} = require('../utils');
const Channel = require('./Channel');

module.exports = class ChannelMultiplex extends EventEmitter {
    constructor() {
        super();
        this._backendMap = new Map();
        this._frontendMap = new Map();
    }
    destory() {
        const destoryChannel = ({channel}) => channel && channel.destory && channel.destory();
        this.getBackends().forEach(destoryChannel);
        this.getFrontends().forEach(destoryChannel);
        this._backendMap.clear();
        this._frontendMap.clear();
    }
    createBackendChannel(id, ws) {
        const {url, title, favicon} = ws;
        const channel = new Channel(id, ws);
        logger.info(`${getColorfulName('backend')} ${chalk.green('connected')} ${id}:${truncate(title, 10)}`);
        const backendData = {
            id,
            title,
            url,
            favicon,
            get alive() {
                return channel && channel.isAlive();
            },
            channel
        };
        this._backendMap.set(id, backendData);

        channel.on('close', () => this.removeBackendChannel(id, title));
        this.emit('backendAppend', backendData);
    }
    createFrontendChannel(id, ws, targetId) {
        const backendId = targetId;
        const backendChannel = this._backendMap.get(backendId);
        if (!backendChannel || !backendChannel.channel) {
            // 这种情况是没有backend channel， frontend先于backend打开；或者backend关闭，frontend刷新
            // eslint-disable-next-line max-len
            ws.send(
                JSON.stringify({
                    event: 'backendConnectionNotFound',
                    payload: {backendId: backendChannel ? backendChannel.id : 'null'}
                })
            );
            return ws.close();
        }

        const channel = new Channel(id, ws);
        logger.info(
            // eslint-disable-next-line max-len
            `${getColorfulName('frontend')} ${chalk.green('connected')} ${id} to backend ${
                backendChannel.id
            }:${truncate(backendChannel.title, 10)}`
        );
        channel.connect(backendChannel.channel);
        const frontendData = {
            id,
            backendId: backendChannel.id,
            channel
        };
        const mapId = `${backendChannel.id}-${id}`;
        const oldChannelData = this._frontendMap.get(mapId);
        if (oldChannelData && oldChannelData.channel && oldChannelData.channel.destroy) {
            // 一个类型保持一个
            oldChannelData.channel.destroy();
        }
        this._frontendMap.set(mapId, frontendData);
        channel.on('close', () => this.removeFrontendChannel(mapId));
        backendChannel.channel.on('close', () => channel.destroy());

        this.emit('frontendAppend', frontendData);
    }
    removeBackendChannel(id, title = '') {
        logger.info(`${getColorfulName('backend')} ${chalk.red('disconnected')} ${id}:${truncate(title, 10)}`);
        this._backendMap.delete(id);
        this.emit('backendRemove', {id});
    }
    removeFrontendChannel(id) {
        logger.info(`${getColorfulName('frontend')} ${chalk.red('disconnected')} ${id}`);
        this._frontendMap.delete(id);
        this.emit('frontendRemove', {id});
    }
    getBackendById(id) {
        return this._backendMap.get(id);
    }
    getBackends() {
        return Array.from(this._backendMap.values());
    }
    getFrontends() {
        return Array.from(this._frontendMap.values());
    }
};
