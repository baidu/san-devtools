/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Webpack configure
 */

import webpack from 'webpack';
import rider from 'rider';
import autoprefixer from 'autoprefixer';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

let productionMode = false;

export default {
    devtool: productionMode ? false : 'source-map',

    entry: {
        'js/background/background.min.js'
            : './src/js/background/background.js',
        'js/background/popup.min.js'
            : './src/js/background/popup.js',
        'js/devtool/devtool_background.min.js'
            : './src/js/devtool/devtool_background.js',
        'js/host/invasion.min.js'
            : './src/js/host/invasion.js',
        'panel/index.min.js'
            : './src/panel/index.js',
        'js/host/host_entry.min.js'
            : './src/js/host/host_entry.js'
    },
    output: {
        path: './dist',
        filename: '[name]'
    },
    stylus: {
        use: [rider()]
    },
    postcss: [
        autoprefixer({})
    ],
    module: {
        loaders: [
            {
                test: /\.js?$/,
                loader: 'babel-loader',
                query: {
                    plugins: ['transform-runtime'],
                    presets: [
                        ['es2015'],
                        'es2015-script',
                        'stage-1'
                    ]
                },
                exclude: /node_modules/
            },
            {
                test: /\.(styl|css)$/,
                loader: 'style-loader!css-loader!stylus-loader?paths=node_modules'
            },
            {
                test: /\.san$/,
                loader: 'san-loader'
            },
            {
                test: /\.(eot|woff|woff2|ttf)$/,
                loader: "url-loader"
            },
            
            {
                test: /\.(png|jpe?g|gif|svg)(\?.*)?$/,
                loader: 'url-loader'
            },
            {
                test: /\.(html|tpl)(\?.*)?$/,
                loader: 'html-loader'
            }
        ],
        // require
        unknownContextRegExp: /$^/,
        unknownContextCritical: false,
        // require(expr)
        exprContextRegExp: /$^/,
        exprContextCritical: false,
        // require("prefix" + expr + "surfix")
        wrappedContextRegExp: /$^/,
        wrappedContextCritical: false
    },
    plugins: [
        new webpack.DefinePlugin({
            'process.env': {
                'NODE_ENV': productionMode
                    ? JSON.stringify('production')
                        : undefined
            },
            'SAN_DEVTOOL': JSON.stringify('__san_devtool__')
        }),
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            exclude: /invasion/i
        }),
        new CleanWebpackPlugin([
            'dist'
        ]),
        new CopyWebpackPlugin([{
            from: './src'
        }])
    ]
};
