#!/usr/bin/env node

/**
 * San DevHook
 * Copyright 2017 Baidu Inc. All rights reserved.
 *
 * @file Extension test.
 */


var path = require('path');
var chromeKiller = require('chrome-killer');
var chromeLauncher = require('chrome-launcher');

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

var argv = {
    directory: __dirname
};

var launcherOptions = {
    port: argv.port,
    enableExtensions: true,
    handleSIGINT: argv.forceQuit,
    chromePath: argv.chromePath,
    startingUrl: argv.url,
    chromeFlags: [
        '--load-extension='
            + path.resolve(argv.directory, '../dist/extensions/chrome'),
        argv.auto ? '--auto-open-devtools-for-tabs' : '',
        '--force-fieldtrials=ExtensionDeveloperModeWarning/None/'
    ]
}

killChromeIfNeeded(argv, chromeLauncher.launch(launcherOptions))
    .then(function() {
        console.log(' > san-devtool-hook-test loaded.');
        console.log(' > Please check the newly opened Chrome/Chromium window.');
    }
);
