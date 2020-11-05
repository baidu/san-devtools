const config = require('./webpack.config');
const webpack = require('webpack');
const { fork } = require('child_process');
const path = require('path');
const chalk = require('chalk');

const compiler = webpack(config);

compiler.hooks.invalid.tap('invalid', () => {
    console.log('Compiling...');
});

compiler.hooks.done.tap('done', (stats) => {
    console.log(stats.toString());
    console.log('compiled success!');
});

compiler.hooks.failed.tap('failed', (error) => {
    console.log(chalk.red('compiled failed!'), error);
});

compiler.hooks.compilation.tap('logSourceName', (compilation) => {
    compilation.hooks.buildModule.tap('logSourceName',
        module => {
            console.log(module.resource);
        }
    );
});

let serverExsited = false;

compiler.watch(
    {},
    (err, stats) => {
        if (!err) {
            if (!serverExsited) {
                console.log('Webpack compiled, watching files...');
                fork('./bin/san-devtools.js', [], {cwd: path.join(__dirname)});
                serverExsited = true;
            }
        }
    }
)