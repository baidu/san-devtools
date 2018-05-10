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
    directory: __dirname,
    url: path.resolve(__dirname, '..', 'resources', 'browser', 'index.html')
};

var launcherOptions = {
    port: argv.port,
    enableExtensions: true,
    handleSIGINT: argv.forceQuit,
    chromePath: argv.chromePath,
    startingUrl: argv.url
}

killChromeIfNeeded(argv, chromeLauncher.launch(launcherOptions))
    .then(function() {
        console.log(' > san-devhook loaded.');
        console.log(' > Please check the newly opened Chrome/Chromium window.');
    }
);
