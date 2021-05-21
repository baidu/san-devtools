/**
 * @file 配置文件
 */

const path = require('path');
const {createConfig} = require('build-tools');

const isProd = process.env.NODE_ENV === 'production';
module.exports = createConfig({
    devtool: isProd ? false : 'eval-cheap-source-map',
    entry: {
        backend: './backend.ts'
    },
    output: {
        publicPath: isProd ? './' : '/',
        path: path.resolve(__dirname, 'dist'),
        filename: '[name].js'
    }
});
