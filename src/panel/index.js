/**
 * San Devtools
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Devtool panel main entry.
 */

import Messenger from 'chrome-ext-messenger'; 

import './index.styl';
import App from './App.san';

new App().attach(document.querySelector('#root'));

let messenger = new Messenger();
let connector = messenger.initConnection('panel_index', () => {
    // Nothing
});

document.addEventListener('DOMContentLoaded', () => {
    connector.sendMessage('background:no_blinking', {
        from: 'devtool:panel_index'
    });
});


