/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Webpack configure
 */

import webpack from 'webpack';
import merge from 'webpack-merge';
import CleanWebpackPlugin from 'clean-webpack-plugin';
import CopyWebpackPlugin from 'copy-webpack-plugin';
import path from 'path';

const productionMode = process.env.NODE_ENV === 'production';

process.noDeprecation = true;

const productionConfig = {
};

const developConfig = {
    devtool: 'source-map'
};

const extConfig = {
    entry: {
    }
}

let baseConfig = {
    entry: {
        'san_devhook.js': './src/invasion.js'
    },
    output: {
        path: (env => {
            switch (env) {
                case 'chrome_ext':
                    return path.resolve(__dirname, 'dist/extensions/chrome');
                default:
                    return path.resolve(__dirname, 'dist');
            }
        })(process.env.NODE_ENV),
        libraryTarget: 'umd',
        filename: '[name]'
    },
    module: {
        noParse: /node_modules\/acorn\/dist\/acorn.js/,
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
        ]
    },
    plugins: [
        new webpack.DefinePlugin({
            'SAN_DEVTOOL': JSON.stringify('__san_devtool__'),
            'HOST': JSON.stringify('sanDevHook')
        }),
        new CleanWebpackPlugin([
            'dist'
        ]),
        process.env.NODE_ENV.indexOf('ext') > -1 ? new CopyWebpackPlugin([{
            from: './resources/extensions', to: '..'
        }, {
            from: './resources/icons', to: 'icons'
        }]) : new webpack.DefinePlugin({})
    ]
};

export default merge(baseConfig, (env => {
    switch (env) {
        case 'develop':
            return developConfig;
        case 'production':
            return productionConfig;
        case 'chrome_ext':
            return extConfig;
    }
})(process.env.NODE_ENV));
