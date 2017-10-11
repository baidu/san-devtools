#!/usr/bin/env node

var path = require('path');
var chromeKiller = require('chrome-killer');
var chromeLauncher = require('chrome-launcher');
var yargs = require('yargs')
    .usage('<san-devtool/> ' + require('../package.json').version + '\n' +
        'Usage: san-devtool --chrome-path=path-of-chrome --url=page-to-inspect')
    .help('help')
    .alias('help', 'h');

yargs.options({
    'chrome-path': {
        type: 'string',
        alias: 'c',
        describe: '(optional) Path of Chrome/Chromium executable.'
    },
    'directory': {
        type: 'string',
        alias: 'd',
        default: __dirname,
        describe: '(optional) Specify the directory for unpacked san-devtool.'
    },
    'url': {
        type: 'string',
        alias: 'u',
        describe: '(optional) Specify the url to load.'
    },
    'auto': {
        type: 'boolean',
        alias: 'a',
        default: false,
        describe: '(optional) Open devtools automatically.'
    },
    'kill': {
        type: 'boolean',
        alias: 'k',
        default: false,
        describe: '(optional) Kill entire browser before loading san-devtool.'
    },
    'port': {
        type: 'number',
        alias: 'p',
        default: 8929,
        describe: '(optional) Remote debugging port number to use.'
    },
    'force-quit': {
        type: 'boolean',
        alias: 'f',
        default: false,
        describe: '(optional) Close the Chrome/Chromium process on `Ctrl-C`'
    }
});

function killChromeIfNeeded(argv, promise) {
    return argv.kill
        ? chromeKiller({
              includingMainProcess: true,
              instancePath: argv.chromePath
          }).then(function() {
              return promise;
          })
        : promise;
}

var argv = yargs.argv;

var launcherOptions = {
    port: argv.port,
    enableExtensions: true,
    handleSIGINT: argv.forceQuit,
    chromePath: argv.chromePath,
    startingUrl: argv.url,
    chromeFlags: [
        '--load-extension=' + path.resolve(argv.directory, '../dist'),
        argv.auto ? '--auto-open-devtools-for-tabs' : '',
        '--force-fieldtrials=ExtensionDeveloperModeWarning/None/'
    ]
}

killChromeIfNeeded(argv, chromeLauncher.launch(launcherOptions))
    .then(function() {
        console.log(' > san-devtool loaded.');
        console.log(' > Please check the newly opened Chrome/Chromium window.');
    }
);
