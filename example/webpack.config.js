/**
 * @file 配置文件
 */
const path = require('path');
const HTMLWebpackPlugin = require('html-webpack-plugin');
const resolve = p => path.resolve(__dirname, '../', p);

module.exports = {
    devtool: false,
    resolve: {
        extensions: ['.js', '.jsx', '.san', '.json', '.ts'],
        alias: {
            '@src': resolve('example/src/')
        }
    },
    entry: [path.join(__dirname, 'src', 'main.js')],
    output: {
        path: path.join(__dirname, 'dist')
    },
    devServer: {
        before: app => {
            app.all('*', function (req, res, next) {
                res.header('Access-Control-Allow-Origin', '*');
                res.header('Access-Control-Allow-Methods', 'GET,HEAD,OPTIONS,POST,PUT');
                // eslint-disable-next-line
                res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
                next();
            });
        },
        port: 10086,
        open: true
    },
    module: {
        rules: [
            {
                test: /\.js$/,
                exclude: /node_modules/,
                use: 'babel-loader'
            },
            {
                test: /\.san$/,
                use: 'san-loader'
            },
            {
                test: /\.(png|jpe?g|gif|svg|woff2?|eot|ttf|otf)(\?.*)?$/,
                use: [
                    {
                        loader: 'url-loader',
                        options: {
                            limit: 10000
                        }
                    }
                ]
            },
            {
                test: /\.css/,
                use: ['style-loader', 'css-loader']
            }
        ]
    },
    plugins: [
        new HTMLWebpackPlugin({
            template: 'index.html'
        })
    ]
};
