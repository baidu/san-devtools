const config = require('../webpack.config');
const webpack = require('webpack');
const {exec} = require('child_process');
const path = require('path');
const chalk = require('chalk');

const compiler = webpack(config);

compiler.hooks.failed.tap('failed', error => {
    console.log(chalk.red('compiled failed!'), error);
});

compiler.hooks.compilation.tap('logSourceName', compilation => {
    compilation.hooks.buildModule.tap('logSourceName',
        module => {
            module.resource && console.log(module.resource);
        }
    );
});

if (process.env.NODE_ENV !== 'production') {
    compiler.hooks.invalid.tap('invalid', () => {
        console.log('Compiling...');
    });

    compiler.watch(
        {},
        (err, stats) => {
            if (!err) {
                console.log(stats.toString());
                console.log('compiled success!');
            }
        }
    );
} else {
    compiler.run((err, stats) => {
        if (!err) {
            console.log(stats.toString());
            console.log('compiled success!');
            if (!process.argv.includes('nozip')) {
                const child = exec('yarn zip', {cwd: path.join(__dirname)});
                child.stdout.on('data', data => {
                    console.log(chalk.green(`[ZIP]: ${data}`));
                });
            }
        }
    });
}
