/**
 * Copyright (c) Baidu Inc. All rights reserved.
 *
 * This source code is licensed under the MIT license.
 * See LICENSE file in the project root for license information.
 *
 * @file createConfig.js
 */

const path = require('path');
const {merge} = require('webpack-merge');
const SanLoaderPlugin = require('san-loader/lib/plugin');
const TerserPlugin = require('terser-webpack-plugin');
const OptimizeCSSAssetsPlugin = require('optimize-css-assets-webpack-plugin');
const MiniCssExportPlugin = require('mini-css-extract-plugin');

const DefinePlugin = require('webpack/lib/DefinePlugin');
const NamedModulesPlugin = require('webpack/lib/NamedModulesPlugin');

const resolve = p => path.resolve(__dirname, p);

const isProd = process.env.NODE_ENV === 'production';

const baseConfig = {
    output: {
        path: resolve('dist'),
        publicPath: '/',
        filename: 'js/[name].js'
    },
    devtool: isProd ? false : 'cheap-module-eval-source-map',
    // devtool: false,
    mode: isProd ? 'production' : 'development',
    resolve: {
        extensions: ['.js', '.san', '.json', '.ts'],
        alias: {
            '@backend': resolve('packages/backend/src/'),
            '@shared': resolve('packages/shared/src/'),
            '@frontend': resolve('packages/frontend/src/')
        }
    },
    devServer: {
        port: process.env.PORT,
        overlay: true,
        hot: true,
        inline: true
    },
    module: {
        rules: [
            {
                test: /\.ts$/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            plugins: [
                                '@babel/plugin-proposal-export-default-from',
                                '@babel/plugin-transform-modules-commonjs',
                                '@babel/plugin-proposal-optional-chaining',
                                require.resolve('@babel/plugin-proposal-class-properties'),
                                require.resolve('san-hot-loader/lib/babel-plugin')
                            ],
                            presets: [
                                require.resolve('@babel/preset-env'),
                                [require.resolve('@babel/preset-typescript'), {allExtensions: true}]
                            ]
                        }
                    }
                ]
            },
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: [
                    {
                        loader: 'babel-loader',
                        options: {
                            rootMode: 'upward'
                        }
                    }
                ]
            },
            {
                oneOf: [
                    {
                        test: /\.svg$/,
                        resourceQuery: /inline/,
                        use: [
                            {
                                loader: 'url-loader',
                                options: {
                                    limit: 8192
                                }
                            }
                        ]
                    },
                    {
                        test: /\.(eot|woff|woff2|ttf|svg)$/,
                        loader: 'file-loader',
                        options: {
                            limit: 6000,
                            name: 'icons/[name]-[hash:8].[ext]'
                        }
                    },
                    {
                        test: /\.less$/,
                        use: [
                            isProd ? MiniCssExportPlugin.loader : 'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    config: {
                                        path: './postcss.config.js'
                                    }
                                }
                            },
                            {
                                loader: 'less-loader',
                                options: {
                                    lessOptions: {
                                        // strictMath: true,
                                        javascriptEnabled: true
                                    }
                                }
                            }
                        ]
                    },
                    {
                        test: /\.css$/,
                        use: [
                            isProd ? MiniCssExportPlugin.loader : 'style-loader',
                            'css-loader',
                            {
                                loader: 'postcss-loader',
                                options: {
                                    config: {
                                        path: './postcss.config.js'
                                    }
                                }
                            }
                        ]
                    }
                ]
            },
            {
                test: /\.png$/,
                use: [
                    {
                        loader: 'file-loader',
                        options: {
                            mimetype: 'image/png',
                            limit: 6000,
                            name: 'icons/[name]-[hash:8].[ext]',
                            esModule: false
                        }
                    }
                ]
            },
            {
                test: /\.san$/,
                use: 'san-loader'
            },
            {
                test: /\.html$/,
                use: [
                    {
                        loader: 'html-loader',
                        options: {
                            esModule: false,
                            minimize: false,
                            attributes: {
                                list: [
                                    {
                                        tag: 'img',
                                        attribute: 'src',
                                        type: 'src'
                                    },
                                    {
                                        tag: 'san-avatar',
                                        attribute: 'src',
                                        type: 'src'
                                    }
                                ]
                            }
                        }
                    }
                ]
            }
        ]
    },
    plugins: [
        new SanLoaderPlugin(),
        new NamedModulesPlugin(),
        new DefinePlugin({
            __DEBUG__: !isProd,
            SAN_DEVTOOL: JSON.stringify('__san_devtool__'),
            'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
        })
    ]
};

if (isProd) {
    baseConfig.plugins.push(new MiniCssExportPlugin());
    baseConfig.optimization = {
        splitChunks: {
            cacheGroups: {
                santd: {
                    test(module, chunks) {
                        const test = /[\\/]node_modules[\\/]santd/;
                        if (module.nameForCondition && test.test(module.nameForCondition())) {
                            return module.type === 'javascript/auto';
                        }
                        for (const chunk of module.chunksIterable) {
                            if (chunk.name && test.test(chunk.name)) {
                                return module.type === 'javascript/auto';
                            }
                        }
                        return false;
                    },
                    name: 'santd',
                    chunks: 'all'
                }
            }
        },
        minimizer: [
            new TerserPlugin({
                extractComments: false,
                sourceMap: false,
                parallel: true,
                cache: true,
                terserOptions: {
                    comments: false,
                    compress: {
                        unused: true,
                        // 删掉 debugger
                        drop_debugger: true, // eslint-disable-line
                        // 移除 console
                        drop_console: true, // eslint-disable-line
                        // 移除无用的代码
                        dead_code: true // eslint-disable-line
                    },
                    ie8: false,
                    safari10: true,
                    warnings: false,
                    toplevel: true
                }
            }),
            new OptimizeCSSAssetsPlugin({
                assetNameRegExp: /\.css$/g,
                cssProcessorOptions: {
                    mergeLonghand: false,
                    cssDeclarationSorter: false,
                    normalizeUrl: false,
                    discardUnused: false,
                    // 避免 cssnano 重新计算 z-index
                    zindex: false,
                    reduceIdents: false,
                    safe: true,
                    // cssnano 集成了autoprefixer的功能
                    // 会使用到autoprefixer进行无关前缀的清理
                    // 关闭autoprefixer功能
                    // 使用postcss的autoprefixer功能
                    autoprefixer: false,
                    discardComments: {
                        removeAll: true
                    }
                },
                canPrint: true
            })
        ]
    };
}

exports.createConfig = config => merge(baseConfig, config);
