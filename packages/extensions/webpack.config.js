/**
 * @file 配置文件
 */

const path = require('path');
const CopyPlugin = require('copy-webpack-plugin');
const HtmlWebpackPlugin = require('html-webpack-plugin');
const {CleanWebpackPlugin} = require('clean-webpack-plugin');
const {createConfig} = require('build-tools');

const WebpackExtensionManifestPlugin = require('webpack-extension-manifest-plugin');
const pkg = require('./package.json');
const resolve = p => path.resolve(__dirname, p);
const baseManifest = require('./chrome/manifest.json');

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
        new CleanWebpackPlugin(),
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
        }),
        new CopyPlugin({
            patterns: [
                {
                    from: './icons',
                    to: 'icons'
                }
            ]
        }),
        new WebpackExtensionManifestPlugin({
            config: {
                base: baseManifest,
                extend: {version: pkg.version}
            }
        })
    ]
});
