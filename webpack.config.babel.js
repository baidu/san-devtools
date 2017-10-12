/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Webpack configure
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import rider from 'rider';
import autoprefixer from 'autoprefixer';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

let productionMode = process.env.NODE_ENV === 'production';

let productionConfig = {
    devtool: false,
    plugins: [
        new webpack.optimize.UglifyJsPlugin({
            compress: {
                warnings: false
            },
            exclude: /invasion/i
        })
    ]
};

let developConfig = {
    devtool: 'source-map'
};

let baseConfig = {
    entry: {
        'js/background/background.js'
            : './src/js/background/background.js',
        'js/background/popup.js'
            : './src/js/background/popup.js',
        'js/devtool/devtool_background.js'
            : './src/js/devtool/devtool_background.js',
        'js/host/invasion.js'
            : './src/js/host/invasion.js',
        'panel/index.js'
            : './src/panel/index.js',
        'js/host/host_entry.js'
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
                test: /\.styl$/,
                loader: 'style-loader!css-loader!stylus-loader?paths=node_modules'
            },
            {
                test: /\.css$/,
                loader: 'style-loader!css-loader'
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
            'SAN_DEVTOOL': JSON.stringify('__san_devtool__'),
            'IN_BROWSER': true
        }),
        new CleanWebpackPlugin([
            'dist'
        ]),
        new CopyWebpackPlugin([{
            from: './src/manifest.json', to: 'manifest.json'
        }, {
            from: './src/html', to: 'html'
        }, {
            from: './src/icons', to: 'icons'
        }])
    ]
};

export default merge(baseConfig,
    productionMode ? productionConfig : developConfig);
