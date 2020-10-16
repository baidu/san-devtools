/**
 * @file 配置文件
 */

const path = require('path');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const createConfig = require('../../createConfig');

const pkg = require('./package.json');
const resolve = p => path.resolve(__dirname, p);

module.exports = createConfig({
    entry: {
        background: './src/background.ts',
        panel: './src/panel.ts',
        relay: './src/contentScript/relay.ts',
        popup: './src/popup.ts',
        content_script: './src/contentScript/contentScript.ts', // eslint-disable-line
        san_devtools_backend: './src/contentScript/backend.ts', // eslint-disable-line
        devtools_page: './src/devtoolsPage.ts' // eslint-disable-line
    },
    output: {
        path: resolve('dist'),
        publicPath: '/',
        filename: 'js/[name].js'
    },
    plugins: [
        new HtmlWebpackPlugin({
            templateParameters: {
                ...pkg
            },
            template: resolve('template/popup.ejs'),
            filename: 'popup.html',
            chunks: ['popup']
        }),
        new HtmlWebpackPlugin({
            template: resolve('template/default.ejs'),
            filename: 'panel.html',
            chunks: ['panel']
        }),
        new HtmlWebpackPlugin({
            title: 'San DevTools Page',
            filename: 'devtools_page.html',
            chunks: ['devtools_page']
        })
    ]
});
