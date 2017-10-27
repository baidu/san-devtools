/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	var _injector = __webpack_require__(78);

	var _injector2 = _interopRequireDefault(_injector);

	var _hook = __webpack_require__(115);

	var _interchange = __webpack_require__(116);

	var _interchange2 = _interopRequireDefault(_interchange);

	var _version = __webpack_require__(61);

	var _version2 = _interopRequireDefault(_version);

	var _highlighter = __webpack_require__(62);

	var _highlighter2 = _interopRequireDefault(_highlighter);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 将 hook 对象挂在到 window.__san_devtool__ 上。此代码应该尽早的执行。
	_injector2.default.fromContentScript(_hook.installSanHook.toString(), 'window');

	// 将需要挂在到 window.__san_devtool__ 上的脚本入口文件引入到页面上。并布置 san 的
	// listeners。
	// FIXME: 不应该使用同步的方式。
	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file Content script 入口，注入 hook 脚本。
	 */

	_injector2.default.fromExtensionUrlSync(chrome.runtime.getURL('js/host/host_entry.js'));

	// 布置监听器将版本信息传递给 background。
	_version2.default.init();

	// 布置监听器用于中转由页面发往 devtool 的 San 事件。
	_interchange2.default.init();

/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

	!function(e,n){ true?module.exports=n():"function"==typeof define&&define.amd?define("chrome-ext-messenger",[],n):"object"==typeof exports?exports["chrome-ext-messenger"]=n():e["chrome-ext-messenger"]=n()}(this,function(){return function(e){function n(o){if(t[o])return t[o].exports;var r=t[o]={exports:{},id:o,loaded:!1};return e[o].call(r.exports,r,r.exports,n),r.loaded=!0,r.exports}var t={};return n.m=e,n.c=t,n.p="",n(0)}([function(e,n,t){"use strict";var o=t(1),r=t(6),i=t(2),s=t(5),a=function(){i.constructorTweakMethods("Messenger",this),this._myExtPart=i.getCurrentExtensionPart()};a.prototype.constructor=a,a.isMessengerPort=function(e){return 0===e.name.indexOf(s.MESSENGER_PORT_NAME_PREFIX)},a.prototype.initBackgroundHub=function(e){return this._myExtPart!==s.BACKGROUND?void i.log("warn","[Messenger:initBackgroundHub]","Ignoring BackgroundHub init request since not called from background context"):this._backgroundHub?void i.log("warn","[Messenger:initBackgroundHub]","Ignoring BackgroundHub init request since it is already been inited"):void(this._backgroundHub=new o(e))},a.prototype.initConnection=function(e,n){return e||i.log("error","[Messenger:initConnection]",'Missing "name" in arguments'),e===s.TO_NAME_WILDCARD&&i.log("error","[Messenger:initConnection]",'"*" is reserved as a wildcard identifier, please use another name'),new r(this._myExtPart,e,n)},e.exports=a},function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=t(2),r=t(5),i=1,s=function(e){o.constructorTweakMethods("BackgroundHub",this),e=e||{},this._connectedHandler=e.connectedHandler,this._disconnectedHandler=e.disconnectedHandler,this._backgroundPorts={},this._contentScriptPorts={},this._popupPorts={},this._devtoolPorts={},chrome.runtime.onConnect.addListener(this._onPortConnected),window.mockPortOnConnect=this._onPortConnected};s.prototype.constructor=s,s.prototype._onPortConnected=function(e){o.log("log","[BackgroundHub:runtime.onConnect]",arguments),0===e.name.indexOf(r.MESSENGER_PORT_NAME_PREFIX)&&(e.onMessage.addListener(this._onPortMessageHandler),e.onDisconnect.addListener(this._onPortDisconnectionHandler))},s.prototype._onPortMessageHandler=function(e,n){switch(e.type){case r.INIT:this._initConnection(e,n);break;case r.MESSAGE:case r.RESPONSE:e.to||o.log("error","[BackgroundHub:_onPortMessageHandler]",'Missing "to" in message:',e),e.toNames||o.log("error","[BackgroundHub:_onPortMessageHandler]",'Missing "toNames" in message:',e),this._relayMessage(e,n);break;default:o.log("error","[BackgroundHub:_onPortMessageHandler]","Unknown message type: "+e.type)}},s.prototype._getPortsObj=function(e){switch(e){case r.BACKGROUND:return this._backgroundPorts;case r.CONTENT_SCRIPT:return this._contentScriptPorts;case r.POPUP:return this._popupPorts;case r.DEVTOOL:return this._devtoolPorts;default:o.log("error","[BackgroundHub:_onPortDisconnectionHandler]","Unknown extension part: "+e)}},s.prototype._initConnection=function(e,n){var t=function(e,t){var i=this._getPortsObj(e);if(i[t]=i[t]?i[t]:[],i[t].push(n),this._connectedHandler){var s=e!==r.BACKGROUND?t:null,a=o.removeMessengerPortNamePrefix(n.name);this._connectedHandler(e,a,s)}n.postMessage({from:r.BACKGROUND,type:r.INIT_SUCCESS})}.bind(this);if(e.from===r.BACKGROUND)t(r.BACKGROUND,i);else if(e.from===r.DEVTOOL)t(r.DEVTOOL,e.tabId);else if(e.from===r.CONTENT_SCRIPT)t(r.CONTENT_SCRIPT,n.sender.tab.id);else{if(e.from!==r.POPUP)throw new Error('Unknown "from" in message: '+e.from);t(r.POPUP,e.tabId)}},s.prototype._relayMessage=function(e,n){var t=e.from,s=e.to,a=e.toNames,c=e.toTabId,u=void 0;t===r.BACKGROUND?s!==r.BACKGROUND&&(u=c):t===r.DEVTOOL?u=e.tabId:t===r.POPUP?u=e.tabId:t===r.CONTENT_SCRIPT?u=n.sender.tab.id:o.log("error","[BackgroundHub:_relayMessage]",'Unknown "from" in message: '+t),e.fromTabId=u;var d=void 0;s===r.BACKGROUND?d=this._backgroundPorts[i]?this._backgroundPorts[i]:[]:s===r.DEVTOOL?d=this._devtoolPorts[u]?this._devtoolPorts[u]:[]:s===r.POPUP?d=this._popupPorts[u]?this._popupPorts[u]:[]:s===r.CONTENT_SCRIPT?d=this._contentScriptPorts[u]?this._contentScriptPorts[u]:[]:o.log("error","[BackgroundHub:_relayMessage]",'Unknown "to" in message: '+s),0===d.length&&o.log("info","[BackgroundHub:_relayMessage]",'Not sending relay because "to" port does not exist');var l=[];a.forEach(function(e){var n=d.filter(function(n){return n.name===e||e===r.TO_NAME_WILDCARD});n.length>0?n.forEach(function(e){l.indexOf(e)===-1&&l.push(e)}):o.log("warn","[BackgroundHub:_relayMessage]","could not find any connections with this name (probably no such name):",o.removeMessengerPortNamePrefix(e))}.bind(this)),e.fromPortSender=n.sender,l.forEach(function(n){n.postMessage(e)}.bind(this))},s.prototype._onPortDisconnectionHandler=function(e){e.onMessage.removeListener(this._onPortMessageHandler);var n=function(e,n){for(var t=this._getPortsObj(e),i=Object.keys(t),s=0;s<i.length;s++){for(var a=i[s],c=t[a],u=c.length,d=u;d>=0;d--){var l=c[d];if(l===n&&(o.log("log","[BackgroundHub:_onPortDisconnectionHandler]","remove connection of port with unique id: ",a),c.splice(d,1),this._disconnectedHandler)){var p=e!==r.BACKGROUND?parseInt(a):null,f=o.removeMessengerPortNamePrefix(n.name);this._disconnectedHandler(e,f,p)}}0===t[a].length&&(o.log("log","[BackgroundHub:_onPortDisconnectionHandler]","removing empty ports object for unique id: ",a),delete t[a])}}.bind(this);n(r.BACKGROUND,e),n(r.CONTENT_SCRIPT,e),n(r.POPUP,e),n(r.DEVTOOL,e)},n.default=s,e.exports=n.default},function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=t(3),r=t(5),i=new o({prefix:"messenger-log",markdown:!1}),s=new o({prefix:"messenger-info",markdown:!1}),a=new o({prefix:"messenger-warn",markdown:!1}),c=new o({prefix:"messenger-error",markdown:!1});o.disable("messenger*","-messenger-error","-messenger-warn");var u={log:function(e){var n=Array.prototype.slice.call(arguments,1);switch(e){case"log":i.log.apply(i,n);break;case"info":s.info.apply(s,n);break;case"warn":a.warn.apply(a,n);break;case"error":throw c.error.apply(c,n),"Messenger error occurred, check more information above...";default:c.error("Unknown log level: "+e)}},constructorTweakMethods:function(e,n){var t=function(t){var o=n[t];n[t]=function(){return i.log("["+e+":"+t+"()]",arguments),o.apply(n,arguments)}.bind(n)};for(var o in n)"function"==typeof n[o]&&t(o)},getCurrentExtensionPart:function(){var e=void 0;if("undefined"!=typeof chrome)if(chrome.devtools)e=r.DEVTOOL;else if(chrome.extension&&"function"==typeof chrome.extension.getBackgroundPage){var n=chrome.extension.getBackgroundPage();e=n===window?r.BACKGROUND:r.POPUP}else e=r.CONTENT_SCRIPT;else c.error("Could not identify extension part... are you running in a chrome extension context?");return i.log("detected current extension part: "+e),e},removeMessengerPortNamePrefix:function(e){return e.replace(new RegExp("^"+r.MESSENGER_PORT_NAME_PREFIX),"")}};n.default=u,e.exports=n.default},function(e,n,t){(function(n){!function(){"use strict";function t(e){if(!(this instanceof t))return new t(e);e=e||{};var n=void 0===e.prefix?"":e.prefix;return n=p(n),n&&d(n,m)?l(n,m):(this.alignOutput=Boolean(e.alignOutput),this.markdown=void 0===e.markdown||e.markdown,this.prefix=n,m.push(this),o(m),h()?(this.prefixColor=b[_%b.length],_+=1):g()&&(this.prefixColor=v()),this)}function o(e){var n=e.sort(function(e,n){return n.prefix.length-e.prefix.length})[0];e.forEach(function(e){if(e.alignOutput){var t=new Array(Math.max(n.prefix.length-e.prefix.length+1,0)).join(" ");e.prefix=e.prefix+t}})}function r(e){for(var n=[],t=i(e);t;)e=e.replace(t.rule.regexp,t.rule.replacer),h()&&(n.push(t.rule.style),n.push("")),t=i(e);return{text:e,styles:n}}function i(e){var n=[],t=[];return h()?t=[{regexp:/\*([^\*]+)\*/,replacer:function(e,n){return"%c"+n+"%c"},style:"font-weight:bold;"},{regexp:/_([^_]+)_/,replacer:function(e,n){return"%c"+n+"%c"},style:"font-style:italic;"},{regexp:/`([^`]+)`/,replacer:function(e,n){return"%c"+n+"%c"},style:"background:#FDF6E3; color:#586E75; padding:1px 5px; border-radius:4px;"}]:g()&&(t=[{regexp:/\*([^\*]+)\*/,replacer:function(e,n){return"["+P.modifiers.bold[0]+"m"+n+"["+P.modifiers.bold[1]+"m"}},{regexp:/_([^_]+)_/,replacer:function(e,n){return"["+P.modifiers.italic[0]+"m"+n+"["+P.modifiers.italic[1]+"m"}},{regexp:/`([^`]+)`/,replacer:function(e,n){return"["+P.bgColors.bgYellow[0]+"m["+P.colors.black[0]+"m "+n+" ["+P.colors.black[1]+"m["+P.bgColors.bgYellow[1]+"m"}}]),t.forEach(function(t){var o=e.match(t.regexp);o&&n.push({rule:t,match:o})}),0===n.length?null:(n.sort(function(e,n){return e.match.index-n.match.index}),n[0])}function s(e,n){var t,o=[];return n.prefix?f()?(o.push("%c"+n.prefix+"%c "),o.push("color:"+n.prefixColor+"; font-weight:bold;","")):o.push("["+n.prefix+"] "):o.push(""),"string"==typeof e[0]?n.markdown&&f()?(t=r(e[0]),o[0]=o[0]+t.text,o=o.concat(t.styles)):o[0]=o[0]+e[0]:o[0]=e[0],e.length>1&&(o=o.concat(e.splice(1))),o}function a(e,n,t){var o=[];return t.prefix&&(f()?o[0]="["+t.prefixColor[0]+"m["+P.modifiers.bold[0]+"m"+t.prefix+"["+P.modifiers.bold[1]+"m["+t.prefixColor[1]+"m":o[0]="["+t.prefix+"]"),"warn"===n?o[0]="["+P.colors.yellow[0]+"m⚠["+P.colors.yellow[1]+"m "+(o[0]||""):"error"===n?o[0]="["+P.colors.red[0]+"m✖["+P.colors.red[1]+"m "+(o[0]||""):"info"===n?o[0]="["+P.colors.blue[0]+"mℹ["+P.colors.blue[1]+"m "+(o[0]||""):"debug"===n&&(o[0]="["+P.colors.gray[0]+"m🐛["+P.colors.gray[1]+"m "+(o[0]||"")),e.forEach(function(e){"string"==typeof e&&t.markdown?o.push(r(e).text):o.push(e)}),o}function c(e){var o=null;"undefined"!=typeof n&&void 0!==n.env&&0===y.length&&(void 0!==n.env.NODE_DEBUG&&""!==n.env.NODE_DEBUG?o="NODE_DEBUG":void 0!==n.env.DEBUG&&""!==n.env.DEBUG&&(o="DEBUG"),o&&(t.disable("*"),n.env[o].split(",").forEach(function(e){t.enable(e)})));var r=!1;return y.forEach(function(n){"enable"===n.type&&n.regExp.test(e.prefix)?r=!1:"disable"===n.type&&n.regExp.test(e.prefix)&&(r=!0)}),r}function u(e){return new RegExp("^"+e.replace(/\*/g,".*?")+"$")}function d(e,n){var t=!1;return n.forEach(function(n){if(n.prefix===e)return void(t=!0)}),t}function l(e,n){var t;return n.forEach(function(n){if(n.prefix===e)return void(t=n)}),t}function p(e){return"string"==typeof e?e.replace(/%c/g,""):e}function f(){if(h()){var e="WebkitAppearance"in document.documentElement.style,t=window.console&&(console.firebug||console.exception&&console.table),o=navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)&&parseInt(RegExp.$1,10)>=31;return e||t||o}if(g())return!(n.stdout&&!n.stdout.isTTY)&&("win32"===n.platform||("COLORTERM"in n.env||"dumb"!==n.env.TERM&&!!/^screen|^xterm|^vt100|color|ansi|cygwin|linux/i.test(n.env.TERM)))}function g(){return"undefined"!=typeof e&&"undefined"!=typeof e.exports}function h(){return"undefined"!=typeof window}var m=[],_=0,b=["#B58900","#CB4B16","#DC322F","#D33682","#6C71C4","#268BD2","#2AA198","#859900"],P={modifiers:{reset:[0,0],bold:[1,22],dim:[2,22],italic:[3,23],underline:[4,24],inverse:[7,27],hidden:[8,28],strikethrough:[9,29]},colors:{black:[30,39],red:[31,39],green:[32,39],yellow:[33,39],blue:[34,39],magenta:[35,39],cyan:[36,39],white:[37,39],gray:[90,39]},bgColors:{bgBlack:[40,49],bgRed:[41,49],bgGreen:[42,49],bgYellow:[43,49],bgBlue:[44,49],bgMagenta:[45,49],bgCyan:[46,49],bgWhite:[47,49]}},y=[];t.enable=function(){Array.prototype.forEach.call(arguments,function(e){"-"===e[0]&&t.disable(e.substr(1));var n=u(e);"*"===e?y=[]:y.push({type:"enable",regExp:n})})},t.disable=function(){Array.prototype.forEach.call(arguments,function(e){"-"===e[0]&&t.enable(e.substr(1));var n=u(e);"*"===e?y=[{type:"disable",regExp:n}]:y.push({type:"disable",regExp:n})})};var E=["debug","log","info","warn","error"];E.forEach(function(e){t.prototype[e]=function(){if(!c(this)){var n,t=Array.prototype.slice.call(arguments,0);h()?(n=s(t,this),Function.prototype.apply.call(console[e]||console.log,console,n)):g()&&(n=a(t,e,this),(console[e]||console.log).apply(console,n))}}});var v=function(){var e=0,n=[[31,39],[32,39],[33,39],[34,39],[35,39],[36,39]];return function(){return n[(e+=1)%n.length]}}();g()?e.exports=t:h()&&(window.Logdown=t)}()}).call(n,t(4))},function(e,n){function t(){throw new Error("setTimeout has not been defined")}function o(){throw new Error("clearTimeout has not been defined")}function r(e){if(d===setTimeout)return setTimeout(e,0);if((d===t||!d)&&setTimeout)return d=setTimeout,setTimeout(e,0);try{return d(e,0)}catch(n){try{return d.call(null,e,0)}catch(n){return d.call(this,e,0)}}}function i(e){if(l===clearTimeout)return clearTimeout(e);if((l===o||!l)&&clearTimeout)return l=clearTimeout,clearTimeout(e);try{return l(e)}catch(n){try{return l.call(null,e)}catch(n){return l.call(this,e)}}}function s(){h&&f&&(h=!1,f.length?g=f.concat(g):m=-1,g.length&&a())}function a(){if(!h){var e=r(s);h=!0;for(var n=g.length;n;){for(f=g,g=[];++m<n;)f&&f[m].run();m=-1,n=g.length}f=null,h=!1,i(e)}}function c(e,n){this.fun=e,this.array=n}function u(){}var d,l,p=e.exports={};!function(){try{d="function"==typeof setTimeout?setTimeout:t}catch(e){d=t}try{l="function"==typeof clearTimeout?clearTimeout:o}catch(e){l=o}}();var f,g=[],h=!1,m=-1;p.nextTick=function(e){var n=new Array(arguments.length-1);if(arguments.length>1)for(var t=1;t<arguments.length;t++)n[t-1]=arguments[t];g.push(new c(e,n)),1!==g.length||h||r(a)},c.prototype.run=function(){this.fun.apply(null,this.array)},p.title="browser",p.browser=!0,p.env={},p.argv=[],p.version="",p.versions={},p.on=u,p.addListener=u,p.once=u,p.off=u,p.removeListener=u,p.removeAllListeners=u,p.emit=u,p.binding=function(e){throw new Error("process.binding is not supported")},p.cwd=function(){return"/"},p.chdir=function(e){throw new Error("process.chdir is not supported")},p.umask=function(){return 0}},function(e,n){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var t={MESSENGER_PORT_NAME_PREFIX:"__messenger__",TO_NAME_WILDCARD:"*",BACKGROUND:"background",POPUP:"popup",DEVTOOL:"devtool",CONTENT_SCRIPT:"content_script",INIT:"init",INIT_SUCCESS:"init_success",MESSAGE:"message",RESPONSE:"response"};n.default=t,e.exports=n.default},function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=t(7),r=t(2),i=t(5),s=500,a=1e5,c=5e3,u=function(e,n,t){r.constructorTweakMethods("Connection",this),this._init(e,n,t)};u.prototype.constructor=u,u.prototype._init=function(e,n,t){switch(this._port=null,this._inited=!1,this._pendingInitMessages=[],this._pendingCb={},this._cbId=0,this._pendingCbCleanupIndex=0,this._myExtPart=e,this._myName=i.MESSENGER_PORT_NAME_PREFIX+n,this._userMessageHandler=t||function(){},this._myExtPart){case i.BACKGROUND:case i.CONTENT_SCRIPT:case i.POPUP:case i.DEVTOOL:var a=function(e){r.log("log","[Connection:_init]","Attempting connection initing..."),this._port=this._myExtPart===i.BACKGROUND?new o({name:this._myName}):chrome.runtime.connect({name:this._myName}),this._port.onMessage.addListener(this._onPortMessageHandler),this._port.postMessage({type:i.INIT,from:this._myExtPart,tabId:e});var n=arguments,t=setTimeout(function(){this._inited?clearTimeout(t):(this._port.disconnect(),a.apply(this,n))}.bind(this),s)}.bind(this);switch(this._myExtPart){case i.BACKGROUND:case i.CONTENT_SCRIPT:a();break;case i.POPUP:chrome.tabs.query({active:!0,currentWindow:!0},function(e){a(e[0].id)});break;case i.DEVTOOL:a(chrome.devtools.inspectedWindow.tabId)}break;default:r.log("error","[Connection:_init]","Unknown extension part: "+e)}},u.prototype._attemptDeadCbCleanup=function(){if(Object.keys(this._pendingCb).length>a){r.log("log","[Connection:_attemptDeadCbCleanup]","attempting dead callback cleaning... current callbacks number:".Object.keys(this._pendingCb).length);for(var e=this._pendingCbCleanupIndex+c;this._pendingCbCleanupIndex<e;)delete this._pendingCb[this._pendingCbCleanupIndex],this._pendingCbCleanupIndex++;r.log("log","[Connection:_attemptDeadCbCleanup]","new callbacks number after cleaning done:",Object.keys(this._pendingCb).length)}},u.prototype._prepareMessage=function(e,n){var t=this;return new Promise(function(o){switch(n&&(t._cbId++,t._pendingCb[t._cbId]=n,e.cbId=t._cbId,t._attemptDeadCbCleanup()),t._myExtPart){case i.DEVTOOL:e.tabId=chrome.devtools.inspectedWindow.tabId,o();break;case i.POPUP:chrome.tabs.query({active:!0,currentWindow:!0},function(n){e.tabId=n[0].id,o()}.bind(t));break;default:o()}})},u.prototype._postMessage=function(e,n,t){var o=this;this._prepareMessage(n,t).then(function(){o._inited?e.postMessage(n):o._pendingInitMessages.push(n)})},u.prototype._postResponse=function(e,n,t){var o={from:this._myExtPart,to:t.from,toNames:[t.fromName],type:i.RESPONSE,cbId:t.cbId,cbValue:n};this._myExtPart===i.BACKGROUND&&(o.toTabId=t.fromTabId),this._postMessage(e,o)},u.prototype._handleMessage=function(e,n){var t=function(t){e.cbId&&this._postResponse(n,t,e)}.bind(this),o=r.removeMessengerPortNamePrefix(e.fromName),s=e.fromTabId&&e.from!==i.BACKGROUND?":"+e.fromTabId:null,a=e.from+":"+o+(s?":"+s:"");this._userMessageHandler(e.userMessage,a,e.fromPortSender,t)},u.prototype._handleResponse=function(e){if(this._pendingCb[e.cbId]){var n=this._pendingCb[e.cbId];delete this._pendingCb[e.cbId],n(e.cbValue)}else r.log("info","[Connection:_handleResponse]","ignoring response sending because callback does not exist (probably already been called)")},u.prototype._sendMessage=function(e,n,t,o,r,s){t=this._addMessengerPortNamePrefix(t);var a={from:this._myExtPart,fromName:this._myName,to:n,toNames:t,toTabId:o,type:i.MESSAGE,userMessage:r};this._postMessage(e,a,s)},u.prototype._addMessengerPortNamePrefix=function(e){return e.map(function(e){return e===i.TO_NAME_WILDCARD?e:i.MESSENGER_PORT_NAME_PREFIX+e})},u.prototype._validateMessage=function(e,n,t){if(!e)return'Missing extension part in "to" argument';if(e!==i.BACKGROUND&&e!==i.CONTENT_SCRIPT&&e!==i.DEVTOOL&&e!==i.POPUP)return'Unknown extension part in "to" argument: '+e+"\nSupported parts are: "+i.BACKGROUND+", "+i.CONTENT_SCRIPT+", "+i.POPUP+", "+i.DEVTOOL;if(!n)return'Missing connection name in "to" argument';if(this._myExtPart===i.BACKGROUND&&e!==i.BACKGROUND){if(!t)return'Messages from background to other extension parts must have a tab id in "to" argument';if(!Number.isInteger(parseFloat(t)))return"Tab id to send message to must be a valid number"}},u.prototype._onPortMessageHandler=function(e,n){switch(e.type){case i.INIT_SUCCESS:this._inited=!0,this._pendingInitMessages.forEach(function(e){this._port.postMessage(e)}.bind(this));break;case i.MESSAGE:case i.RESPONSE:e.to||r.log("error","[Connection:_onPortMessageHandler]",'Missing "to" in message: ',e),e.toNames||r.log("error","[Connection:_onPortMessageHandler]",'Missing "toNames" in message: ',e),e.type===i.MESSAGE?this._handleMessage(e,n):e.type===i.RESPONSE&&this._handleResponse(e);break;default:r.log("error","[Connection:_onPortMessageHandler]","Unknown message type: "+e.type)}},u.prototype.sendMessage=function(e,n){var t=this,o=arguments;return new Promise(function(i){if(e||r.log("error","[Connection:sendMessage]",'missing "to" arguments'),t._port){var s=void 0;try{s=e.split(":")}catch(n){r.log("error","[Connection:sendMessage]",'Invalid format given in "to" argument: '+e,o)}var a=s[0],c=s[1],u=s[2],d=t._validateMessage(a,c,u);d&&r.log("error","[Connection:sendMessage]",d,o);var l=c.split(",");t._sendMessage(t._port,a,l,u,n,i)}else r.log("warn","[Connection:sendMessage]","ignoring sending message because connection does not exist anymore, did you disconnected it?")})},u.prototype.disconnect=function(){this._port&&(this._port.disconnect(),this._port=null)},n.default=u,e.exports=n.default},function(e,n,t){"use strict";Object.defineProperty(n,"__esModule",{value:!0});var o=t(2),r=function(e){o.constructorTweakMethods("MockPort",this);var n=this._createMockPort(e),t=this._createMockPort(e);return this._linkMocks(n,t),"function"==typeof window.mockPortOnConnect&&window.mockPortOnConnect(t),n};r.prototype.constructor=r,r.prototype._createMockPort=function(e){var n={_connected:!0,_name:e.name,onMessageListeners:[],onDisconnectListeners:[]};return Object.defineProperty(n,"name",{get:function(){return n._name}}),Object.defineProperty(n,"onMessage",{get:function(){return{addListener:function(e){n.onMessageListeners.push(e)},removeListener:function(e){var t=n.onMessageListeners.indexOf(e);t!==-1&&n.onMessageListeners.splice(t,1)}}}}),Object.defineProperty(n,"onDisconnect",{get:function(){return{addListener:function(e){n.onDisconnectListeners.push(e)},removeListener:function(e){var t=n.onDisconnectListeners.indexOf(e);t!==-1&&n.onDisconnectListeners.splice(t,1)}}}}),Object.defineProperty(n,"sender",{get:function(){return{id:chrome.runtime.id}}}),n.postMessage=function(e){n._connected?n.__targetRefPort?n.__targetRefPort.__invokeOnMessageHandlers(e):o.log("warn","[MockPort:postMessage]","Missing __targetRefPort",arguments):o.log("warn","[MockPort:postMessage]","Attempting to post message on a disconnected mock port",e)},n.disconnect=function(){n._connected=!1,n.__targetRefPort?n.__targetRefPort.__invokeOnDisconnectHandlers():o.log("warn","[MockPort:postMessage]","Missing __targetRefPort",arguments),n._onMessageListeners=[],n._onDisconnectListeners=[]},n.__invokeOnMessageHandlers=function(e){n.onMessageListeners.forEach(function(t){t(e,n)})},n.__invokeOnDisconnectHandlers=function(){n.onDisconnectListeners.forEach(function(e){e(n)})},n},r.prototype._linkMocks=function(e,n){e.__targetRefPort=n,n.__targetRefPort=e},n.default=r,e.exports=n.default}])});
	//# sourceMappingURL=chrome-ext-messenger.min.js.map

/***/ }),
/* 2 */,
/* 3 */,
/* 4 */,
/* 5 */,
/* 6 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * San DevTools
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file Constants
	 */

	exports.default = {

	    sanEventNames: ['comp-compiled', 'comp-inited', 'comp-created', 'comp-attached', 'comp-detached', 'comp-disposed', 'comp-updated', 'comp-route'],

	    subTreeKey: 'treeData'

	};

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _getIterator2 = __webpack_require__(8);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * San DevTools
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file Utils
	 */

	exports.default = {
	    normalizeVersionNumber: function normalizeVersionNumber(version) {
	        var reg = /^\d+(\.\d+)+(\-\b\w*\b)?$/;
	        if (!version || typeof version !== 'string') {
	            return null;
	        }
	        if (!reg.test(version)) {
	            return '';
	        }
	        return version;
	    },
	    toLocaleDatetime: function toLocaleDatetime(timestamp) {
	        return new Date(+timestamp).toLocaleString(navigator.language, {
	            hour12: false,
	            month: '2-digit',
	            hour: '2-digit',
	            minute: '2-digit',
	            second: '2-digit',
	            day: '2-digit',
	            year: '2-digit',
	            weekday: 'short'
	        });
	    },
	    isBrowser: function isBrowser() {
	        return typeof window !== 'undefined';
	    },
	    isContentScript: function isContentScript() {
	        return chrome && chrome.extension;
	    },
	    isSanComponent: function isSanComponent(component) {
	        if (!window[("__san_devtool__")] || !window[("__san_devtool__")].san) {
	            return false;
	        }
	        return component instanceof window[("__san_devtool__")].san.Component;
	    },
	    getXPath: function (_getXPath) {
	        function getXPath(_x) {
	            return _getXPath.apply(this, arguments);
	        }

	        getXPath.toString = function () {
	            return _getXPath.toString();
	        };

	        return getXPath;
	    }(function (element) {
	        if (!element) {
	            return '';
	        }
	        if (element.id !== '') {
	            return 'id("' + element.id + '")';
	        }
	        if (element === document.body) {
	            return element.tagName;
	        }

	        var c = 0;
	        var siblings = element.parentNode.childNodes;
	        var _iteratorNormalCompletion = true;
	        var _didIteratorError = false;
	        var _iteratorError = undefined;

	        try {
	            for (var _iterator = (0, _getIterator3.default)(siblings), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	                var i = _step.value;

	                if (i === element) {
	                    return getXPath(element.parentNode) + '/' + element.tagName + '[' + (ix + 1) + ']';
	                }
	                if (i.nodeType === Node.ELEMENT_NODE && i.tagName === element.tagName) {
	                    ix++;
	                }
	            }
	        } catch (err) {
	            _didIteratorError = true;
	            _iteratorError = err;
	        } finally {
	            try {
	                if (!_iteratorNormalCompletion && _iterator.return) {
	                    _iterator.return();
	                }
	            } finally {
	                if (_didIteratorError) {
	                    throw _iteratorError;
	                }
	            }
	        }
	    }),
	    getSanIdElementCount: function getSanIdElementCount() {
	        return document.evaluate('//*[contains(@id,"_san_")]', document, null, XPathResult.ORDERED_NODE_SNAPSHOT_TYPE).snapshotLength;
	    }
	};

/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(9), __esModule: true };

/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(10);
	__webpack_require__(56);
	module.exports = __webpack_require__(58);


/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(11);
	var global = __webpack_require__(22);
	var hide = __webpack_require__(26);
	var Iterators = __webpack_require__(14);
	var TO_STRING_TAG = __webpack_require__(53)('toStringTag');

	var DOMIterables = ('CSSRuleList,CSSStyleDeclaration,CSSValueList,ClientRectList,DOMRectList,DOMStringList,' +
	  'DOMTokenList,DataTransferItemList,FileList,HTMLAllCollection,HTMLCollection,HTMLFormElement,HTMLSelectElement,' +
	  'MediaList,MimeTypeArray,NamedNodeMap,NodeList,PaintRequestList,Plugin,PluginArray,SVGLengthList,SVGNumberList,' +
	  'SVGPathSegList,SVGPointList,SVGStringList,SVGTransformList,SourceBufferList,StyleSheetList,TextTrackCueList,' +
	  'TextTrackList,TouchList').split(',');

	for (var i = 0; i < DOMIterables.length; i++) {
	  var NAME = DOMIterables[i];
	  var Collection = global[NAME];
	  var proto = Collection && Collection.prototype;
	  if (proto && !proto[TO_STRING_TAG]) hide(proto, TO_STRING_TAG, NAME);
	  Iterators[NAME] = Iterators.Array;
	}


/***/ }),
/* 11 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var addToUnscopables = __webpack_require__(12);
	var step = __webpack_require__(13);
	var Iterators = __webpack_require__(14);
	var toIObject = __webpack_require__(15);

	// 22.1.3.4 Array.prototype.entries()
	// 22.1.3.13 Array.prototype.keys()
	// 22.1.3.29 Array.prototype.values()
	// 22.1.3.30 Array.prototype[@@iterator]()
	module.exports = __webpack_require__(19)(Array, 'Array', function (iterated, kind) {
	  this._t = toIObject(iterated); // target
	  this._i = 0;                   // next index
	  this._k = kind;                // kind
	// 22.1.5.2.1 %ArrayIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var kind = this._k;
	  var index = this._i++;
	  if (!O || index >= O.length) {
	    this._t = undefined;
	    return step(1);
	  }
	  if (kind == 'keys') return step(0, index);
	  if (kind == 'values') return step(0, O[index]);
	  return step(0, [index, O[index]]);
	}, 'values');

	// argumentsList[@@iterator] is %ArrayProto_values% (9.4.4.6, 9.4.4.7)
	Iterators.Arguments = Iterators.Array;

	addToUnscopables('keys');
	addToUnscopables('values');
	addToUnscopables('entries');


/***/ }),
/* 12 */
/***/ (function(module, exports) {

	module.exports = function () { /* empty */ };


/***/ }),
/* 13 */
/***/ (function(module, exports) {

	module.exports = function (done, value) {
	  return { value: value, done: !!done };
	};


/***/ }),
/* 14 */
/***/ (function(module, exports) {

	module.exports = {};


/***/ }),
/* 15 */
/***/ (function(module, exports, __webpack_require__) {

	// to indexed object, toObject with fallback for non-array-like ES3 strings
	var IObject = __webpack_require__(16);
	var defined = __webpack_require__(18);
	module.exports = function (it) {
	  return IObject(defined(it));
	};


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for non-array-like ES3 and non-enumerable old V8 strings
	var cof = __webpack_require__(17);
	// eslint-disable-next-line no-prototype-builtins
	module.exports = Object('z').propertyIsEnumerable(0) ? Object : function (it) {
	  return cof(it) == 'String' ? it.split('') : Object(it);
	};


/***/ }),
/* 17 */
/***/ (function(module, exports) {

	var toString = {}.toString;

	module.exports = function (it) {
	  return toString.call(it).slice(8, -1);
	};


/***/ }),
/* 18 */
/***/ (function(module, exports) {

	// 7.2.1 RequireObjectCoercible(argument)
	module.exports = function (it) {
	  if (it == undefined) throw TypeError("Can't call method on  " + it);
	  return it;
	};


/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY = __webpack_require__(20);
	var $export = __webpack_require__(21);
	var redefine = __webpack_require__(36);
	var hide = __webpack_require__(26);
	var has = __webpack_require__(37);
	var Iterators = __webpack_require__(14);
	var $iterCreate = __webpack_require__(38);
	var setToStringTag = __webpack_require__(52);
	var getPrototypeOf = __webpack_require__(54);
	var ITERATOR = __webpack_require__(53)('iterator');
	var BUGGY = !([].keys && 'next' in [].keys()); // Safari has buggy iterators w/o `next`
	var FF_ITERATOR = '@@iterator';
	var KEYS = 'keys';
	var VALUES = 'values';

	var returnThis = function () { return this; };

	module.exports = function (Base, NAME, Constructor, next, DEFAULT, IS_SET, FORCED) {
	  $iterCreate(Constructor, NAME, next);
	  var getMethod = function (kind) {
	    if (!BUGGY && kind in proto) return proto[kind];
	    switch (kind) {
	      case KEYS: return function keys() { return new Constructor(this, kind); };
	      case VALUES: return function values() { return new Constructor(this, kind); };
	    } return function entries() { return new Constructor(this, kind); };
	  };
	  var TAG = NAME + ' Iterator';
	  var DEF_VALUES = DEFAULT == VALUES;
	  var VALUES_BUG = false;
	  var proto = Base.prototype;
	  var $native = proto[ITERATOR] || proto[FF_ITERATOR] || DEFAULT && proto[DEFAULT];
	  var $default = $native || getMethod(DEFAULT);
	  var $entries = DEFAULT ? !DEF_VALUES ? $default : getMethod('entries') : undefined;
	  var $anyNative = NAME == 'Array' ? proto.entries || $native : $native;
	  var methods, key, IteratorPrototype;
	  // Fix native
	  if ($anyNative) {
	    IteratorPrototype = getPrototypeOf($anyNative.call(new Base()));
	    if (IteratorPrototype !== Object.prototype && IteratorPrototype.next) {
	      // Set @@toStringTag to native iterators
	      setToStringTag(IteratorPrototype, TAG, true);
	      // fix for some old engines
	      if (!LIBRARY && !has(IteratorPrototype, ITERATOR)) hide(IteratorPrototype, ITERATOR, returnThis);
	    }
	  }
	  // fix Array#{values, @@iterator}.name in V8 / FF
	  if (DEF_VALUES && $native && $native.name !== VALUES) {
	    VALUES_BUG = true;
	    $default = function values() { return $native.call(this); };
	  }
	  // Define iterator
	  if ((!LIBRARY || FORCED) && (BUGGY || VALUES_BUG || !proto[ITERATOR])) {
	    hide(proto, ITERATOR, $default);
	  }
	  // Plug for library
	  Iterators[NAME] = $default;
	  Iterators[TAG] = returnThis;
	  if (DEFAULT) {
	    methods = {
	      values: DEF_VALUES ? $default : getMethod(VALUES),
	      keys: IS_SET ? $default : getMethod(KEYS),
	      entries: $entries
	    };
	    if (FORCED) for (key in methods) {
	      if (!(key in proto)) redefine(proto, key, methods[key]);
	    } else $export($export.P + $export.F * (BUGGY || VALUES_BUG), NAME, methods);
	  }
	  return methods;
	};


/***/ }),
/* 20 */
/***/ (function(module, exports) {

	module.exports = true;


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(22);
	var core = __webpack_require__(23);
	var ctx = __webpack_require__(24);
	var hide = __webpack_require__(26);
	var PROTOTYPE = 'prototype';

	var $export = function (type, name, source) {
	  var IS_FORCED = type & $export.F;
	  var IS_GLOBAL = type & $export.G;
	  var IS_STATIC = type & $export.S;
	  var IS_PROTO = type & $export.P;
	  var IS_BIND = type & $export.B;
	  var IS_WRAP = type & $export.W;
	  var exports = IS_GLOBAL ? core : core[name] || (core[name] = {});
	  var expProto = exports[PROTOTYPE];
	  var target = IS_GLOBAL ? global : IS_STATIC ? global[name] : (global[name] || {})[PROTOTYPE];
	  var key, own, out;
	  if (IS_GLOBAL) source = name;
	  for (key in source) {
	    // contains in native
	    own = !IS_FORCED && target && target[key] !== undefined;
	    if (own && key in exports) continue;
	    // export native or passed
	    out = own ? target[key] : source[key];
	    // prevent global pollution for namespaces
	    exports[key] = IS_GLOBAL && typeof target[key] != 'function' ? source[key]
	    // bind timers to global for call from export context
	    : IS_BIND && own ? ctx(out, global)
	    // wrap global constructors for prevent change them in library
	    : IS_WRAP && target[key] == out ? (function (C) {
	      var F = function (a, b, c) {
	        if (this instanceof C) {
	          switch (arguments.length) {
	            case 0: return new C();
	            case 1: return new C(a);
	            case 2: return new C(a, b);
	          } return new C(a, b, c);
	        } return C.apply(this, arguments);
	      };
	      F[PROTOTYPE] = C[PROTOTYPE];
	      return F;
	    // make static versions for prototype methods
	    })(out) : IS_PROTO && typeof out == 'function' ? ctx(Function.call, out) : out;
	    // export proto methods to core.%CONSTRUCTOR%.methods.%NAME%
	    if (IS_PROTO) {
	      (exports.virtual || (exports.virtual = {}))[key] = out;
	      // export proto methods to core.%CONSTRUCTOR%.prototype.%NAME%
	      if (type & $export.R && expProto && !expProto[key]) hide(expProto, key, out);
	    }
	  }
	};
	// type bitmap
	$export.F = 1;   // forced
	$export.G = 2;   // global
	$export.S = 4;   // static
	$export.P = 8;   // proto
	$export.B = 16;  // bind
	$export.W = 32;  // wrap
	$export.U = 64;  // safe
	$export.R = 128; // real proto method for `library`
	module.exports = $export;


/***/ }),
/* 22 */
/***/ (function(module, exports) {

	// https://github.com/zloirock/core-js/issues/86#issuecomment-115759028
	var global = module.exports = typeof window != 'undefined' && window.Math == Math
	  ? window : typeof self != 'undefined' && self.Math == Math ? self
	  // eslint-disable-next-line no-new-func
	  : Function('return this')();
	if (typeof __g == 'number') __g = global; // eslint-disable-line no-undef


/***/ }),
/* 23 */
/***/ (function(module, exports) {

	var core = module.exports = { version: '2.5.1' };
	if (typeof __e == 'number') __e = core; // eslint-disable-line no-undef


/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

	// optional / simple context binding
	var aFunction = __webpack_require__(25);
	module.exports = function (fn, that, length) {
	  aFunction(fn);
	  if (that === undefined) return fn;
	  switch (length) {
	    case 1: return function (a) {
	      return fn.call(that, a);
	    };
	    case 2: return function (a, b) {
	      return fn.call(that, a, b);
	    };
	    case 3: return function (a, b, c) {
	      return fn.call(that, a, b, c);
	    };
	  }
	  return function (/* ...args */) {
	    return fn.apply(that, arguments);
	  };
	};


/***/ }),
/* 25 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  if (typeof it != 'function') throw TypeError(it + ' is not a function!');
	  return it;
	};


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(27);
	var createDesc = __webpack_require__(35);
	module.exports = __webpack_require__(31) ? function (object, key, value) {
	  return dP.f(object, key, createDesc(1, value));
	} : function (object, key, value) {
	  object[key] = value;
	  return object;
	};


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(28);
	var IE8_DOM_DEFINE = __webpack_require__(30);
	var toPrimitive = __webpack_require__(34);
	var dP = Object.defineProperty;

	exports.f = __webpack_require__(31) ? Object.defineProperty : function defineProperty(O, P, Attributes) {
	  anObject(O);
	  P = toPrimitive(P, true);
	  anObject(Attributes);
	  if (IE8_DOM_DEFINE) try {
	    return dP(O, P, Attributes);
	  } catch (e) { /* empty */ }
	  if ('get' in Attributes || 'set' in Attributes) throw TypeError('Accessors not supported!');
	  if ('value' in Attributes) O[P] = Attributes.value;
	  return O;
	};


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(29);
	module.exports = function (it) {
	  if (!isObject(it)) throw TypeError(it + ' is not an object!');
	  return it;
	};


/***/ }),
/* 29 */
/***/ (function(module, exports) {

	module.exports = function (it) {
	  return typeof it === 'object' ? it !== null : typeof it === 'function';
	};


/***/ }),
/* 30 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = !__webpack_require__(31) && !__webpack_require__(32)(function () {
	  return Object.defineProperty(__webpack_require__(33)('div'), 'a', { get: function () { return 7; } }).a != 7;
	});


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

	// Thank's IE8 for his funny defineProperty
	module.exports = !__webpack_require__(32)(function () {
	  return Object.defineProperty({}, 'a', { get: function () { return 7; } }).a != 7;
	});


/***/ }),
/* 32 */
/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return !!exec();
	  } catch (e) {
	    return true;
	  }
	};


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

	var isObject = __webpack_require__(29);
	var document = __webpack_require__(22).document;
	// typeof document.createElement is 'object' in old IE
	var is = isObject(document) && isObject(document.createElement);
	module.exports = function (it) {
	  return is ? document.createElement(it) : {};
	};


/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.1 ToPrimitive(input [, PreferredType])
	var isObject = __webpack_require__(29);
	// instead of the ES6 spec version, we didn't implement @@toPrimitive case
	// and the second argument - flag - preferred type is a string
	module.exports = function (it, S) {
	  if (!isObject(it)) return it;
	  var fn, val;
	  if (S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (typeof (fn = it.valueOf) == 'function' && !isObject(val = fn.call(it))) return val;
	  if (!S && typeof (fn = it.toString) == 'function' && !isObject(val = fn.call(it))) return val;
	  throw TypeError("Can't convert object to primitive value");
	};


/***/ }),
/* 35 */
/***/ (function(module, exports) {

	module.exports = function (bitmap, value) {
	  return {
	    enumerable: !(bitmap & 1),
	    configurable: !(bitmap & 2),
	    writable: !(bitmap & 4),
	    value: value
	  };
	};


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(26);


/***/ }),
/* 37 */
/***/ (function(module, exports) {

	var hasOwnProperty = {}.hasOwnProperty;
	module.exports = function (it, key) {
	  return hasOwnProperty.call(it, key);
	};


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var create = __webpack_require__(39);
	var descriptor = __webpack_require__(35);
	var setToStringTag = __webpack_require__(52);
	var IteratorPrototype = {};

	// 25.1.2.1.1 %IteratorPrototype%[@@iterator]()
	__webpack_require__(26)(IteratorPrototype, __webpack_require__(53)('iterator'), function () { return this; });

	module.exports = function (Constructor, NAME, next) {
	  Constructor.prototype = create(IteratorPrototype, { next: descriptor(1, next) });
	  setToStringTag(Constructor, NAME + ' Iterator');
	};


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.2 / 15.2.3.5 Object.create(O [, Properties])
	var anObject = __webpack_require__(28);
	var dPs = __webpack_require__(40);
	var enumBugKeys = __webpack_require__(50);
	var IE_PROTO = __webpack_require__(47)('IE_PROTO');
	var Empty = function () { /* empty */ };
	var PROTOTYPE = 'prototype';

	// Create object with fake `null` prototype: use iframe Object with cleared prototype
	var createDict = function () {
	  // Thrash, waste and sodomy: IE GC bug
	  var iframe = __webpack_require__(33)('iframe');
	  var i = enumBugKeys.length;
	  var lt = '<';
	  var gt = '>';
	  var iframeDocument;
	  iframe.style.display = 'none';
	  __webpack_require__(51).appendChild(iframe);
	  iframe.src = 'javascript:'; // eslint-disable-line no-script-url
	  // createDict = iframe.contentWindow.Object;
	  // html.removeChild(iframe);
	  iframeDocument = iframe.contentWindow.document;
	  iframeDocument.open();
	  iframeDocument.write(lt + 'script' + gt + 'document.F=Object' + lt + '/script' + gt);
	  iframeDocument.close();
	  createDict = iframeDocument.F;
	  while (i--) delete createDict[PROTOTYPE][enumBugKeys[i]];
	  return createDict();
	};

	module.exports = Object.create || function create(O, Properties) {
	  var result;
	  if (O !== null) {
	    Empty[PROTOTYPE] = anObject(O);
	    result = new Empty();
	    Empty[PROTOTYPE] = null;
	    // add "__proto__" for Object.getPrototypeOf polyfill
	    result[IE_PROTO] = O;
	  } else result = createDict();
	  return Properties === undefined ? result : dPs(result, Properties);
	};


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

	var dP = __webpack_require__(27);
	var anObject = __webpack_require__(28);
	var getKeys = __webpack_require__(41);

	module.exports = __webpack_require__(31) ? Object.defineProperties : function defineProperties(O, Properties) {
	  anObject(O);
	  var keys = getKeys(Properties);
	  var length = keys.length;
	  var i = 0;
	  var P;
	  while (length > i) dP.f(O, P = keys[i++], Properties[P]);
	  return O;
	};


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.14 / 15.2.3.14 Object.keys(O)
	var $keys = __webpack_require__(42);
	var enumBugKeys = __webpack_require__(50);

	module.exports = Object.keys || function keys(O) {
	  return $keys(O, enumBugKeys);
	};


/***/ }),
/* 42 */
/***/ (function(module, exports, __webpack_require__) {

	var has = __webpack_require__(37);
	var toIObject = __webpack_require__(15);
	var arrayIndexOf = __webpack_require__(43)(false);
	var IE_PROTO = __webpack_require__(47)('IE_PROTO');

	module.exports = function (object, names) {
	  var O = toIObject(object);
	  var i = 0;
	  var result = [];
	  var key;
	  for (key in O) if (key != IE_PROTO) has(O, key) && result.push(key);
	  // Don't enum bug & hidden keys
	  while (names.length > i) if (has(O, key = names[i++])) {
	    ~arrayIndexOf(result, key) || result.push(key);
	  }
	  return result;
	};


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

	// false -> Array#indexOf
	// true  -> Array#includes
	var toIObject = __webpack_require__(15);
	var toLength = __webpack_require__(44);
	var toAbsoluteIndex = __webpack_require__(46);
	module.exports = function (IS_INCLUDES) {
	  return function ($this, el, fromIndex) {
	    var O = toIObject($this);
	    var length = toLength(O.length);
	    var index = toAbsoluteIndex(fromIndex, length);
	    var value;
	    // Array#includes uses SameValueZero equality algorithm
	    // eslint-disable-next-line no-self-compare
	    if (IS_INCLUDES && el != el) while (length > index) {
	      value = O[index++];
	      // eslint-disable-next-line no-self-compare
	      if (value != value) return true;
	    // Array#indexOf ignores holes, Array#includes - not
	    } else for (;length > index; index++) if (IS_INCLUDES || index in O) {
	      if (O[index] === el) return IS_INCLUDES || index || 0;
	    } return !IS_INCLUDES && -1;
	  };
	};


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.15 ToLength
	var toInteger = __webpack_require__(45);
	var min = Math.min;
	module.exports = function (it) {
	  return it > 0 ? min(toInteger(it), 0x1fffffffffffff) : 0; // pow(2, 53) - 1 == 9007199254740991
	};


/***/ }),
/* 45 */
/***/ (function(module, exports) {

	// 7.1.4 ToInteger
	var ceil = Math.ceil;
	var floor = Math.floor;
	module.exports = function (it) {
	  return isNaN(it = +it) ? 0 : (it > 0 ? floor : ceil)(it);
	};


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(45);
	var max = Math.max;
	var min = Math.min;
	module.exports = function (index, length) {
	  index = toInteger(index);
	  return index < 0 ? max(index + length, 0) : min(index, length);
	};


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

	var shared = __webpack_require__(48)('keys');
	var uid = __webpack_require__(49);
	module.exports = function (key) {
	  return shared[key] || (shared[key] = uid(key));
	};


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(22);
	var SHARED = '__core-js_shared__';
	var store = global[SHARED] || (global[SHARED] = {});
	module.exports = function (key) {
	  return store[key] || (store[key] = {});
	};


/***/ }),
/* 49 */
/***/ (function(module, exports) {

	var id = 0;
	var px = Math.random();
	module.exports = function (key) {
	  return 'Symbol('.concat(key === undefined ? '' : key, ')_', (++id + px).toString(36));
	};


/***/ }),
/* 50 */
/***/ (function(module, exports) {

	// IE 8- don't enum bug keys
	module.exports = (
	  'constructor,hasOwnProperty,isPrototypeOf,propertyIsEnumerable,toLocaleString,toString,valueOf'
	).split(',');


/***/ }),
/* 51 */
/***/ (function(module, exports, __webpack_require__) {

	var document = __webpack_require__(22).document;
	module.exports = document && document.documentElement;


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

	var def = __webpack_require__(27).f;
	var has = __webpack_require__(37);
	var TAG = __webpack_require__(53)('toStringTag');

	module.exports = function (it, tag, stat) {
	  if (it && !has(it = stat ? it : it.prototype, TAG)) def(it, TAG, { configurable: true, value: tag });
	};


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

	var store = __webpack_require__(48)('wks');
	var uid = __webpack_require__(49);
	var Symbol = __webpack_require__(22).Symbol;
	var USE_SYMBOL = typeof Symbol == 'function';

	var $exports = module.exports = function (name) {
	  return store[name] || (store[name] =
	    USE_SYMBOL && Symbol[name] || (USE_SYMBOL ? Symbol : uid)('Symbol.' + name));
	};

	$exports.store = store;


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.9 / 15.2.3.2 Object.getPrototypeOf(O)
	var has = __webpack_require__(37);
	var toObject = __webpack_require__(55);
	var IE_PROTO = __webpack_require__(47)('IE_PROTO');
	var ObjectProto = Object.prototype;

	module.exports = Object.getPrototypeOf || function (O) {
	  O = toObject(O);
	  if (has(O, IE_PROTO)) return O[IE_PROTO];
	  if (typeof O.constructor == 'function' && O instanceof O.constructor) {
	    return O.constructor.prototype;
	  } return O instanceof Object ? ObjectProto : null;
	};


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.1.13 ToObject(argument)
	var defined = __webpack_require__(18);
	module.exports = function (it) {
	  return Object(defined(it));
	};


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var $at = __webpack_require__(57)(true);

	// 21.1.3.27 String.prototype[@@iterator]()
	__webpack_require__(19)(String, 'String', function (iterated) {
	  this._t = String(iterated); // target
	  this._i = 0;                // next index
	// 21.1.5.2.1 %StringIteratorPrototype%.next()
	}, function () {
	  var O = this._t;
	  var index = this._i;
	  var point;
	  if (index >= O.length) return { value: undefined, done: true };
	  point = $at(O, index);
	  this._i += point.length;
	  return { value: point, done: false };
	});


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

	var toInteger = __webpack_require__(45);
	var defined = __webpack_require__(18);
	// true  -> String#at
	// false -> String#codePointAt
	module.exports = function (TO_STRING) {
	  return function (that, pos) {
	    var s = String(defined(that));
	    var i = toInteger(pos);
	    var l = s.length;
	    var a, b;
	    if (i < 0 || i >= l) return TO_STRING ? '' : undefined;
	    a = s.charCodeAt(i);
	    return a < 0xd800 || a > 0xdbff || i + 1 === l || (b = s.charCodeAt(i + 1)) < 0xdc00 || b > 0xdfff
	      ? TO_STRING ? s.charAt(i) : a
	      : TO_STRING ? s.slice(i, i + 2) : (a - 0xd800 << 10) + (b - 0xdc00) + 0x10000;
	  };
	};


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(28);
	var get = __webpack_require__(59);
	module.exports = __webpack_require__(23).getIterator = function (it) {
	  var iterFn = get(it);
	  if (typeof iterFn != 'function') throw TypeError(it + ' is not iterable!');
	  return anObject(iterFn.call(it));
	};


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

	var classof = __webpack_require__(60);
	var ITERATOR = __webpack_require__(53)('iterator');
	var Iterators = __webpack_require__(14);
	module.exports = __webpack_require__(23).getIteratorMethod = function (it) {
	  if (it != undefined) return it[ITERATOR]
	    || it['@@iterator']
	    || Iterators[classof(it)];
	};


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

	// getting tag from 19.1.3.6 Object.prototype.toString()
	var cof = __webpack_require__(17);
	var TAG = __webpack_require__(53)('toStringTag');
	// ES3 wrong here
	var ARG = cof(function () { return arguments; }()) == 'Arguments';

	// fallback for IE11 Script Access Denied error
	var tryGet = function (it, key) {
	  try {
	    return it[key];
	  } catch (e) { /* empty */ }
	};

	module.exports = function (it) {
	  var O, T, B;
	  return it === undefined ? 'Undefined' : it === null ? 'Null'
	    // @@toStringTag case
	    : typeof (T = tryGet(O = Object(it), TAG)) == 'string' ? T
	    // builtinTag case
	    : ARG ? cof(O)
	    // ES3 arguments fallback
	    : (B = cof(O)) == 'Object' && typeof O.callee == 'function' ? 'Arguments' : B;
	};


/***/ }),
/* 61 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _chromeExtMessenger = __webpack_require__(1);

	var _chromeExtMessenger2 = _interopRequireDefault(_chromeExtMessenger);

	var _utils = __webpack_require__(7);

	var _utils2 = _interopRequireDefault(_utils);

	var _highlighter = __webpack_require__(62);

	var _highlighter2 = _interopRequireDefault(_highlighter);

	var _listeners = __webpack_require__(63);

	var _listeners2 = _interopRequireDefault(_listeners);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file 版本号处理。
	 */

	function init() {
	    var messenger = new _chromeExtMessenger2.default();
	    var messageHandler = function messageHandler(message, from, sender, sendResponse) {
	        if (window.sanVersion) {
	            sendResponse(window.sanVersion);
	        }
	    };
	    var connector = messenger.initConnection('san_version', messageHandler);
	    getVersionNumberFromPage(function (sanVersion) {
	        connector.sendMessage('background:version', sanVersion, function (res) {
	            // Do nothing.
	        });
	    });
	}

	// DOMContentLoaded 时将版本信息发送给 content script。
	function detectSan() {
	    var global = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : window;

	    global.document.addEventListener('DOMContentLoaded', function () {
	        if (!global || !global[("__san_devtool__")] || !global[("__san_devtool__")].san) {
	            return;
	        }
	        _highlighter2.default.init();
	        global.postMessage({
	            message: 'version',
	            sanVersion: global[("__san_devtool__")].san.version
	        }, '*');
	    });
	}

	// Content script 接收版本信息，并保存在 content script 全局下。
	function getVersionNumberFromPage(callback) {
	    var _this = this;

	    window.addEventListener('message', function (e) {
	        if (e.data && e.data.message === 'version') {
	            window.sanVersion = _utils2.default.normalizeVersionNumber(e.data.sanVersion);
	            if (window.sanVersion === '') {
	                window.sanVersion = 'N/A';
	            }
	            callback.bind(_this)(window.sanVersion);
	        }
	    });
	}

	exports.default = {
	    init: init,
	    detectSan: detectSan
	};

/***/ }),
/* 62 */
/***/ (function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file Highlighter for inspected component 
	 */

	function init() {
	    var highlighter = document.createElement('div');
	    var styles = ['background-color: rgba(111, 168, 220, 0.66)', 'position: fixed', 'z-index: 1000000000000', 'display: none'];
	    highlighter.id = "san_devtool_highlighter";
	    highlighter.style.cssText = styles.join(';');
	    document.body.appendChild(highlighter);
	    return highlighter;
	}

	function final() {
	    var highlighter = document.getElementById('san_devtool_highlighter');
	    if (!highlighter || highlighter.parentElement != document.body) {
	        return;
	    }
	    document.body.removeChild(highlighter);
	}

	function highlight(el) {
	    if (!el) {
	        return;
	    }
	    var rect = el.getBoundingClientRect();
	    var highlighter = document.getElementById('san_devtool_highlighter');
	    if (!highlighter) {
	        init();
	    }
	    highlighter.style.left = rect.left + 'px';
	    highlighter.style.top = rect.top + 'px';
	    highlighter.style.width = rect.width + 'px';
	    highlighter.style.height = rect.height + 'px';
	    highlighter.style.display = 'block';
	}

	function unhighlight() {
	    var highlighter = document.getElementById('san_devtool_highlighter');
	    if (highlighter) {
	        highlighter.style.display = 'none';
	    }
	}

	exports.default = {
	    init: init,
	    final: final,
	    highlight: highlight,
	    unhighlight: unhighlight
	};

/***/ }),
/* 63 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _extends2 = __webpack_require__(64);

	var _extends3 = _interopRequireDefault(_extends2);

	var _getIterator2 = __webpack_require__(8);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _stringify = __webpack_require__(71);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _constants = __webpack_require__(6);

	var _constants2 = _interopRequireDefault(_constants);

	var _utils = __webpack_require__(7);

	var _utils2 = _interopRequireDefault(_utils);

	var _components = __webpack_require__(73);

	var _components2 = _interopRequireDefault(_components);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 获得 devtool 显示组件树所需要的组件的信息。
	var getComponentTreeItemData = function getComponentTreeItemData(component) {
	    return {
	        id: component.id,
	        text: '<' + getComponentName(component) + '> ' + getComponentRouteData(component),
	        secondaryText: component.id,
	        idPath: component.idPath
	    };
	};

	// 生成组件的路径。
	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file San 事件注册。
	 */

	var generatePath = function generatePath(component) {
	    return _components2.default.getComponentPath(component);
	};

	// 生成历史记录信息。
	var getHistoryInfo = function getHistoryInfo(component, message) {
	    return {
	        id: component.id,
	        idPath: component.idPath,
	        componentName: getComponentName(component),
	        timestamp: Date.now(),
	        compData: component.el['__san_data__'],
	        message: message
	    };
	};

	// 生成路由信息。
	var getRouteInfo = function getRouteInfo(component) {
	    return {
	        id: component.id,
	        timestamp: Date.now(),
	        routeData: component.data.get('route') ? JSON.parse((0, _stringify2.default)(component.data.get('route'))) : undefined
	    };
	};

	// 将所有事件信息存入 history 数组，以便后续使用。
	function buildHistory(component, root, message) {
	    if (!root || !root['history']) {
	        return null;
	    }
	    var info = getHistoryInfo(component, message);
	    root['history'].unshift(info);
	    return info;
	}

	function buildRoutes(component, root) {
	    if (!root || !root['routes'] || !component || !component.data) {
	        return null;
	    }
	    var info = getRouteInfo(component);
	    root['routes'].unshift(info);
	    return info;
	}

	function getComponentName(component) {
	    var name = component && (component.subTag || component.constructor.name);
	    if (!name || name.length === 1) {
	        name = component ? component.tagName : 'Component';
	    }
	    return name;
	}

	function getComponentRouteData(component) {
	    var data = getRouteInfo(component);
	    return data.routeData ? 'Route:' + data.routeData.path : '';
	}

	// 注册所有 San 发送给 devtool 的 event listeners。
	// 必须在页面上下文中执行。
	// 必须在 window.__san_devtool__ 挂钩注册好后执行。
	function addSanEventListeners() {
	    if (!_utils2.default.isBrowser()) {
	        return;
	    }
	    var global = this;
	    if (!global || !global[("__san_devtool__")]) {
	        return;
	    }
	    var sanDevtool = global[("__san_devtool__")];

	    // 8 种事件。
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        var _loop = function _loop() {
	            var e = _step.value;

	            sanDevtool.on(e, function () {
	                // 默认第一个参数均为 Component 实例。
	                var component = arguments.length <= 0 ? undefined : arguments[0];

	                if (!component || !component.id) {
	                    return;
	                }

	                if (e === 'comp-route') {
	                    var _data = buildRoutes(arguments.length <= 0 ? undefined : arguments[0], sanDevtool);
	                    if (sanDevtool.devtoolPanelCreated) {
	                        window.postMessage((0, _extends3.default)({}, _data, { message: e }), '*');
	                    }
	                    return;
	                }

	                if (!component.el) {
	                    return;
	                }

	                var path = generatePath(component);
	                var data = getComponentTreeItemData(component);
	                component.idPath = data.idPath = path;

	                buildHistory(component, sanDevtool, e);
	                _components2.default.updatePrimitiveTree(data, e, sanDevtool['data']);
	                var indexList = _components2.default.getIndexListFromPathAndTreeData(path, sanDevtool['data'].treeData);
	                var compData = component.data.raw || component.data.data;

	                component.el['__san_component__'] = component;
	                component.el['__san_path__'] = path;
	                component.el['__san_data__'] = compData;
	                component.el['__san_tree_index__'] = indexList;

	                // 为提高效率在 get 的时候才生成数据。
	                if (!component.el.hasOwnProperty('__san_info__')) {
	                    Object.defineProperty(component.el, '__san_info__', {
	                        get: function get() {
	                            return (0, _extends3.default)({}, _components2.default.serialize(component), {
	                                idPath: path
	                            });
	                        }
	                    });
	                }

	                // 只有当 devtool 面板创建之后才向 content script 发送组件信息。
	                if (sanDevtool.devtoolPanelCreated) {
	                    window.postMessage({
	                        message: e,
	                        id: component.id,
	                        idPath: path,
	                        indexList: indexList,
	                        data: data,
	                        timestamp: Date.now(),
	                        componentName: getComponentName(component),
	                        compData: JSON.parse((0, _stringify2.default)(compData))
	                    }, '*');
	                }
	            });
	        };

	        for (var _iterator = (0, _getIterator3.default)(_constants2.default.sanEventNames), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            _loop();
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }
	}

	exports.default = {
	    addSanEventListeners: addSanEventListeners
	};

/***/ }),
/* 64 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _assign = __webpack_require__(65);

	var _assign2 = _interopRequireDefault(_assign);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = _assign2.default || function (target) {
	  for (var i = 1; i < arguments.length; i++) {
	    var source = arguments[i];

	    for (var key in source) {
	      if (Object.prototype.hasOwnProperty.call(source, key)) {
	        target[key] = source[key];
	      }
	    }
	  }

	  return target;
	};

/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(66), __esModule: true };

/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(67);
	module.exports = __webpack_require__(23).Object.assign;


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.3.1 Object.assign(target, source)
	var $export = __webpack_require__(21);

	$export($export.S + $export.F, 'Object', { assign: __webpack_require__(68) });


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 19.1.2.1 Object.assign(target, source, ...)
	var getKeys = __webpack_require__(41);
	var gOPS = __webpack_require__(69);
	var pIE = __webpack_require__(70);
	var toObject = __webpack_require__(55);
	var IObject = __webpack_require__(16);
	var $assign = Object.assign;

	// should work with symbols and should have deterministic property order (V8 bug)
	module.exports = !$assign || __webpack_require__(32)(function () {
	  var A = {};
	  var B = {};
	  // eslint-disable-next-line no-undef
	  var S = Symbol();
	  var K = 'abcdefghijklmnopqrst';
	  A[S] = 7;
	  K.split('').forEach(function (k) { B[k] = k; });
	  return $assign({}, A)[S] != 7 || Object.keys($assign({}, B)).join('') != K;
	}) ? function assign(target, source) { // eslint-disable-line no-unused-vars
	  var T = toObject(target);
	  var aLen = arguments.length;
	  var index = 1;
	  var getSymbols = gOPS.f;
	  var isEnum = pIE.f;
	  while (aLen > index) {
	    var S = IObject(arguments[index++]);
	    var keys = getSymbols ? getKeys(S).concat(getSymbols(S)) : getKeys(S);
	    var length = keys.length;
	    var j = 0;
	    var key;
	    while (length > j) if (isEnum.call(S, key = keys[j++])) T[key] = S[key];
	  } return T;
	} : $assign;


/***/ }),
/* 69 */
/***/ (function(module, exports) {

	exports.f = Object.getOwnPropertySymbols;


/***/ }),
/* 70 */
/***/ (function(module, exports) {

	exports.f = {}.propertyIsEnumerable;


/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(72), __esModule: true };

/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

	var core = __webpack_require__(23);
	var $JSON = core.JSON || (core.JSON = { stringify: JSON.stringify });
	module.exports = function stringify(it) { // eslint-disable-line no-unused-vars
	  return $JSON.stringify.apply($JSON, arguments);
	};


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _stringify = __webpack_require__(71);

	var _stringify2 = _interopRequireDefault(_stringify);

	var _slicedToArray2 = __webpack_require__(74);

	var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

	var _getIterator2 = __webpack_require__(8);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	var _utils = __webpack_require__(7);

	var _utils2 = _interopRequireDefault(_utils);

	var _constants = __webpack_require__(6);

	var _constants2 = _interopRequireDefault(_constants);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	// 得到当前组件树节点的子组件 id 列表。
	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file 组件相关的公用工具集，可以运行于页面、content script 或者 devtool 上下文。
	 */

	function getIDListFromTreeData(root) {
	    var ids = [];
	    if (!root) {
	        return ids;
	    }
	    root.forEach(function (e, i) {
	        e.id && ids.push(e.id);
	    });
	    return ids;
	}

	// 得到指定组件 id 在当前组件树节点下的索引值。
	function getIndexFromTreeData(id, root) {
	    if (!id || !root || !(root instanceof Array)) {
	        return -1;
	    }
	    var _iteratorNormalCompletion = true;
	    var _didIteratorError = false;
	    var _iteratorError = undefined;

	    try {
	        for (var _iterator = (0, _getIterator3.default)(root.entries()), _step; !(_iteratorNormalCompletion = (_step = _iterator.next()).done); _iteratorNormalCompletion = true) {
	            var _step$value = (0, _slicedToArray3.default)(_step.value, 2),
	                index = _step$value[0],
	                data = _step$value[1];

	            if (data && id === data.id) {
	                return index;
	            }
	        }
	    } catch (err) {
	        _didIteratorError = true;
	        _iteratorError = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion && _iterator.return) {
	                _iterator.return();
	            }
	        } finally {
	            if (_didIteratorError) {
	                throw _iteratorError;
	            }
	        }
	    }

	    return -1;
	}

	// 得到指定组件父子关系路径在当前组件树节点下的索引值列表。
	function getIndexListFromPathAndTreeData(path, root) {
	    var indexList = [];
	    if (!path || !root || !(path instanceof Array) || !(root instanceof Array)) {
	        return indexList;
	    }
	    var r = root;
	    var _iteratorNormalCompletion2 = true;
	    var _didIteratorError2 = false;
	    var _iteratorError2 = undefined;

	    try {
	        for (var _iterator2 = (0, _getIterator3.default)(path.entries()), _step2; !(_iteratorNormalCompletion2 = (_step2 = _iterator2.next()).done); _iteratorNormalCompletion2 = true) {
	            var _step2$value = (0, _slicedToArray3.default)(_step2.value, 2),
	                i = _step2$value[0],
	                p = _step2$value[1];

	            var index = this.getIndexFromTreeData(p, r);
	            if (index < 0 && i !== path.length - 1) {
	                continue;
	            }
	            indexList.push(index);
	            if (i < path.length - 1) {
	                r = r[index]['treeData'];
	            }
	        }
	    } catch (err) {
	        _didIteratorError2 = true;
	        _iteratorError2 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion2 && _iterator2.return) {
	                _iterator2.return();
	            }
	        } finally {
	            if (_didIteratorError2) {
	                throw _iteratorError2;
	            }
	        }
	    }

	    return indexList;
	}

	// 更新和生成基础组件树的具体实现。
	function updatePrimitiveTreeDataByPath(root, data, isDeleted) {
	    var r = root;
	    var owner;
	    var path = data.idPath;
	    var _iteratorNormalCompletion3 = true;
	    var _didIteratorError3 = false;
	    var _iteratorError3 = undefined;

	    try {
	        for (var _iterator3 = (0, _getIterator3.default)(path.entries()), _step3; !(_iteratorNormalCompletion3 = (_step3 = _iterator3.next()).done); _iteratorNormalCompletion3 = true) {
	            var _step3$value = (0, _slicedToArray3.default)(_step3.value, 2),
	                i = _step3$value[0],
	                e = _step3$value[1];

	            var index = this.getIDListFromTreeData(r).indexOf(e);
	            if (!isDeleted) {
	                if (index < 0) {
	                    r.push(i === path.length - 1 ? {
	                        id: e,
	                        text: data.text,
	                        secondaryText: data.secondaryText
	                    } : {
	                        id: e,
	                        text: data.text,
	                        secondaryText: data.secondaryText,
	                        treeData: []
	                    });
	                } else {
	                    if (r[index] && r[index].id === data.id) {
	                        r[index].text = data.text;
	                        r[index].secondaryText = data.secondaryText;
	                    }
	                }
	                var r0 = index < 0 ? r[r.length - 1] : r[index];
	                if (i < path.length - 1 && !r0.treeData) {
	                    r0.treeData = [];
	                }
	                r = r0.treeData;
	            } else {
	                if (index < 0) {
	                    return;
	                } else {
	                    if (i === path.length - 1) {
	                        r.splice(index, 1);
	                        if (r.length === 0 && owner) {
	                            delete owner.treeData;
	                        }
	                    }
	                    if (!r) {
	                        return;
	                    }
	                    if (r[index]) {
	                        owner = r[index];
	                        r = r[index].treeData ? r[index].treeData : null;
	                    }
	                }
	            }
	        }
	    } catch (err) {
	        _didIteratorError3 = true;
	        _iteratorError3 = err;
	    } finally {
	        try {
	            if (!_iteratorNormalCompletion3 && _iterator3.return) {
	                _iterator3.return();
	            }
	        } finally {
	            if (_didIteratorError3) {
	                throw _iteratorError3;
	            }
	        }
	    }

	    return root;
	}

	// 序列化必要的组件信息。
	function serialize(component, includingParent, keepJSON) {
	    if (!component || !_utils2.default.isSanComponent(component) || !component.el) {
	        return null;
	    }
	    return {
	        id: component.id,
	        classList: Array.prototype.slice.call(component.el.classList),
	        elId: component.el.id,
	        tagName: component.tagName,
	        xpath: _utils2.default.getXPath(component.el),
	        subTag: component.subTag,
	        idPath: [component.id],
	        // FIXME:
	        data: keepJSON ? component.data.raw : (0, _stringify2.default)(component.data.raw),
	        parentComponent: includingParent ? serialize(component.parentComponent) : undefined,
	        parentComponentId: component.parentComponent ? [component.parentComponent.id] : [],
	        ownerComponentId: component.owner ? [component.owner.id] : [],
	        parentId: component.parent ? [component.parent.id] : [],
	        constructor: component.constructor.name,
	        // For TreeView
	        text: '<' + (component.subTag || component.constructor.name) + '>',
	        secondaryText: component.id
	    };
	}

	// 根据 component 实例的 parentComponent 生成组件在 DOM 中的父子关系路径。
	function getComponentPath(component) {
	    var dataTmp = component;
	    var path = [dataTmp.id];
	    if (dataTmp.parentComponent && dataTmp.parentComponent.id) {
	        while (dataTmp) {
	            dataTmp = dataTmp.parentComponent;
	            if (dataTmp) {
	                path.unshift(dataTmp.id);
	            }
	        }
	    }
	    return path;
	}

	// 更新 window.__san_devtool__.data 上的基础组件树。
	function updatePrimitiveTree(data, eventName, root, inBack) {
	    if (!data || !data.id || !root) {
	        return;
	    }

	    var global = inBack ? this : window[("__san_devtool__")];

	    switch (eventName) {
	        case 'comp-created':
	            {
	                break;
	            }

	        case 'comp-attached':
	        case 'comp-updated':
	            {
	                this.updatePrimitiveTreeDataByPath(root['treeData'], data, false);
	                break;
	            }

	        case 'comp-detached':
	            {
	                this.updatePrimitiveTreeDataByPath(root['treeData'], data, true);
	                break;
	            }

	        case 'comp-disposed':
	            {
	                break;
	            }
	    }
	}

	exports.default = {
	    updatePrimitiveTree: updatePrimitiveTree,
	    updatePrimitiveTreeDataByPath: updatePrimitiveTreeDataByPath,
	    getComponentPath: getComponentPath,
	    getIDListFromTreeData: getIDListFromTreeData,
	    getIndexFromTreeData: getIndexFromTreeData,
	    getIndexListFromPathAndTreeData: getIndexListFromPathAndTreeData,
	    serialize: serialize
	};

/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _isIterable2 = __webpack_require__(75);

	var _isIterable3 = _interopRequireDefault(_isIterable2);

	var _getIterator2 = __webpack_require__(8);

	var _getIterator3 = _interopRequireDefault(_getIterator2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = function () {
	  function sliceIterator(arr, i) {
	    var _arr = [];
	    var _n = true;
	    var _d = false;
	    var _e = undefined;

	    try {
	      for (var _i = (0, _getIterator3.default)(arr), _s; !(_n = (_s = _i.next()).done); _n = true) {
	        _arr.push(_s.value);

	        if (i && _arr.length === i) break;
	      }
	    } catch (err) {
	      _d = true;
	      _e = err;
	    } finally {
	      try {
	        if (!_n && _i["return"]) _i["return"]();
	      } finally {
	        if (_d) throw _e;
	      }
	    }

	    return _arr;
	  }

	  return function (arr, i) {
	    if (Array.isArray(arr)) {
	      return arr;
	    } else if ((0, _isIterable3.default)(Object(arr))) {
	      return sliceIterator(arr, i);
	    } else {
	      throw new TypeError("Invalid attempt to destructure non-iterable instance");
	    }
	  };
	}();

/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(76), __esModule: true };

/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(10);
	__webpack_require__(56);
	module.exports = __webpack_require__(77);


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

	var classof = __webpack_require__(60);
	var ITERATOR = __webpack_require__(53)('iterator');
	var Iterators = __webpack_require__(14);
	module.exports = __webpack_require__(23).isIterable = function (it) {
	  var O = Object(it);
	  return O[ITERATOR] !== undefined
	    || '@@iterator' in O
	    // eslint-disable-next-line no-prototype-builtins
	    || Iterators.hasOwnProperty(classof(O));
	};


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _promise = __webpack_require__(79);

	var _promise2 = _interopRequireDefault(_promise);

	var _typeof2 = __webpack_require__(99);

	var _typeof3 = _interopRequireDefault(_typeof2);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file Inject the script to page context.
	 */

	function generateCodeString(codeArg, thisArg, mountingKey) {
	    var code = '';

	    if (mountingKey) {
	        code = 'window["' + ("__san_devtool__") + '"].' + mountingKey + '=' + codeArg;
	        return code;
	    }

	    switch (typeof codeArg === 'undefined' ? 'undefined' : (0, _typeof3.default)(codeArg)) {
	        case 'string':
	            code = /^function/i.test(codeArg) ? '(' + codeArg + ')(' + thisArg + ');' : '(function(){' + codeArg + '}).call(' + thisArg + ');';
	            break;
	        case 'function':
	            code = '(' + codeArg.toString() + ').call(' + thisArg + ');';
	            break;
	        default:
	            break;
	    }
	    return code;
	}

	function inject(codeString) {
	    if (!codeString) {
	        return null;
	    }
	    var script = document.createElement('script');
	    script.textContent = codeString;
	    if (document.documentElement) {
	        document.documentElement.appendChild(script);
	        script.parentElement.removeChild(script);
	    }
	    return script;
	}

	function injectUrl(url) {
	    return new _promise2.default(function (resolve, reject) {
	        var script = document.createElement('script');
	        script.src = url;
	        script.onload = resolve;
	        script.onerror = reject;
	        document.documentElement.appendChild(script);
	        script.parentElement.removeChild(script);
	    });
	}

	function injectUrlSync(url) {
	    var request = new XMLHttpRequest();
	    request.open('GET', url, false);
	    request.send(null);
	    var code = void 0;
	    if (request.status === 200) {
	        code = request.responseText;
	    }
	    var script = document.createElement('script');
	    script.textContent = code;
	    document.documentElement.appendChild(script);
	    script.parentElement.removeChild(script);
	    return script;
	}

	function executeJavaScriptFromDevtool(codeString) {
	    return new _promise2.default(function (resolve, reject) {
	        !chrome.devtools && reject('Not in devtools.');
	        chrome.devtools.inspectedWindow.eval(codeString, function (res, ex) {
	            ex && ex.isException && reject(ex.value);
	            resolve(res);
	        });
	    });
	}

	exports.default = {

	    // Must be run in content script context. 
	    fromContentScript: function fromContentScript(codeArg, thisArg, mountingKey) {
	        inject(generateCodeString(codeArg, thisArg, mountingKey));
	    },
	    fromExtensionUrl: function fromExtensionUrl(url) {
	        return injectUrl(url);
	    },
	    fromExtensionUrlSync: function fromExtensionUrlSync(url) {
	        return injectUrlSync(url);
	    },
	    fromDevtool: function fromDevtool(code) {
	        return executeJavaScriptFromDevtool(code);
	    },
	    fromBackground: function fromBackground(code) {}
	};

/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(80), __esModule: true };

/***/ }),
/* 80 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(81);
	__webpack_require__(56);
	__webpack_require__(10);
	__webpack_require__(82);
	__webpack_require__(97);
	__webpack_require__(98);
	module.exports = __webpack_require__(23).Promise;


/***/ }),
/* 81 */
/***/ (function(module, exports) {

	

/***/ }),
/* 82 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var LIBRARY = __webpack_require__(20);
	var global = __webpack_require__(22);
	var ctx = __webpack_require__(24);
	var classof = __webpack_require__(60);
	var $export = __webpack_require__(21);
	var isObject = __webpack_require__(29);
	var aFunction = __webpack_require__(25);
	var anInstance = __webpack_require__(83);
	var forOf = __webpack_require__(84);
	var speciesConstructor = __webpack_require__(87);
	var task = __webpack_require__(88).set;
	var microtask = __webpack_require__(90)();
	var newPromiseCapabilityModule = __webpack_require__(91);
	var perform = __webpack_require__(92);
	var promiseResolve = __webpack_require__(93);
	var PROMISE = 'Promise';
	var TypeError = global.TypeError;
	var process = global.process;
	var $Promise = global[PROMISE];
	var isNode = classof(process) == 'process';
	var empty = function () { /* empty */ };
	var Internal, newGenericPromiseCapability, OwnPromiseCapability, Wrapper;
	var newPromiseCapability = newGenericPromiseCapability = newPromiseCapabilityModule.f;

	var USE_NATIVE = !!function () {
	  try {
	    // correct subclassing with @@species support
	    var promise = $Promise.resolve(1);
	    var FakePromise = (promise.constructor = {})[__webpack_require__(53)('species')] = function (exec) {
	      exec(empty, empty);
	    };
	    // unhandled rejections tracking support, NodeJS Promise without it fails @@species test
	    return (isNode || typeof PromiseRejectionEvent == 'function') && promise.then(empty) instanceof FakePromise;
	  } catch (e) { /* empty */ }
	}();

	// helpers
	var isThenable = function (it) {
	  var then;
	  return isObject(it) && typeof (then = it.then) == 'function' ? then : false;
	};
	var notify = function (promise, isReject) {
	  if (promise._n) return;
	  promise._n = true;
	  var chain = promise._c;
	  microtask(function () {
	    var value = promise._v;
	    var ok = promise._s == 1;
	    var i = 0;
	    var run = function (reaction) {
	      var handler = ok ? reaction.ok : reaction.fail;
	      var resolve = reaction.resolve;
	      var reject = reaction.reject;
	      var domain = reaction.domain;
	      var result, then;
	      try {
	        if (handler) {
	          if (!ok) {
	            if (promise._h == 2) onHandleUnhandled(promise);
	            promise._h = 1;
	          }
	          if (handler === true) result = value;
	          else {
	            if (domain) domain.enter();
	            result = handler(value);
	            if (domain) domain.exit();
	          }
	          if (result === reaction.promise) {
	            reject(TypeError('Promise-chain cycle'));
	          } else if (then = isThenable(result)) {
	            then.call(result, resolve, reject);
	          } else resolve(result);
	        } else reject(value);
	      } catch (e) {
	        reject(e);
	      }
	    };
	    while (chain.length > i) run(chain[i++]); // variable length - can't use forEach
	    promise._c = [];
	    promise._n = false;
	    if (isReject && !promise._h) onUnhandled(promise);
	  });
	};
	var onUnhandled = function (promise) {
	  task.call(global, function () {
	    var value = promise._v;
	    var unhandled = isUnhandled(promise);
	    var result, handler, console;
	    if (unhandled) {
	      result = perform(function () {
	        if (isNode) {
	          process.emit('unhandledRejection', value, promise);
	        } else if (handler = global.onunhandledrejection) {
	          handler({ promise: promise, reason: value });
	        } else if ((console = global.console) && console.error) {
	          console.error('Unhandled promise rejection', value);
	        }
	      });
	      // Browsers should not trigger `rejectionHandled` event if it was handled here, NodeJS - should
	      promise._h = isNode || isUnhandled(promise) ? 2 : 1;
	    } promise._a = undefined;
	    if (unhandled && result.e) throw result.v;
	  });
	};
	var isUnhandled = function (promise) {
	  if (promise._h == 1) return false;
	  var chain = promise._a || promise._c;
	  var i = 0;
	  var reaction;
	  while (chain.length > i) {
	    reaction = chain[i++];
	    if (reaction.fail || !isUnhandled(reaction.promise)) return false;
	  } return true;
	};
	var onHandleUnhandled = function (promise) {
	  task.call(global, function () {
	    var handler;
	    if (isNode) {
	      process.emit('rejectionHandled', promise);
	    } else if (handler = global.onrejectionhandled) {
	      handler({ promise: promise, reason: promise._v });
	    }
	  });
	};
	var $reject = function (value) {
	  var promise = this;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  promise._v = value;
	  promise._s = 2;
	  if (!promise._a) promise._a = promise._c.slice();
	  notify(promise, true);
	};
	var $resolve = function (value) {
	  var promise = this;
	  var then;
	  if (promise._d) return;
	  promise._d = true;
	  promise = promise._w || promise; // unwrap
	  try {
	    if (promise === value) throw TypeError("Promise can't be resolved itself");
	    if (then = isThenable(value)) {
	      microtask(function () {
	        var wrapper = { _w: promise, _d: false }; // wrap
	        try {
	          then.call(value, ctx($resolve, wrapper, 1), ctx($reject, wrapper, 1));
	        } catch (e) {
	          $reject.call(wrapper, e);
	        }
	      });
	    } else {
	      promise._v = value;
	      promise._s = 1;
	      notify(promise, false);
	    }
	  } catch (e) {
	    $reject.call({ _w: promise, _d: false }, e); // wrap
	  }
	};

	// constructor polyfill
	if (!USE_NATIVE) {
	  // 25.4.3.1 Promise(executor)
	  $Promise = function Promise(executor) {
	    anInstance(this, $Promise, PROMISE, '_h');
	    aFunction(executor);
	    Internal.call(this);
	    try {
	      executor(ctx($resolve, this, 1), ctx($reject, this, 1));
	    } catch (err) {
	      $reject.call(this, err);
	    }
	  };
	  // eslint-disable-next-line no-unused-vars
	  Internal = function Promise(executor) {
	    this._c = [];             // <- awaiting reactions
	    this._a = undefined;      // <- checked in isUnhandled reactions
	    this._s = 0;              // <- state
	    this._d = false;          // <- done
	    this._v = undefined;      // <- value
	    this._h = 0;              // <- rejection state, 0 - default, 1 - handled, 2 - unhandled
	    this._n = false;          // <- notify
	  };
	  Internal.prototype = __webpack_require__(94)($Promise.prototype, {
	    // 25.4.5.3 Promise.prototype.then(onFulfilled, onRejected)
	    then: function then(onFulfilled, onRejected) {
	      var reaction = newPromiseCapability(speciesConstructor(this, $Promise));
	      reaction.ok = typeof onFulfilled == 'function' ? onFulfilled : true;
	      reaction.fail = typeof onRejected == 'function' && onRejected;
	      reaction.domain = isNode ? process.domain : undefined;
	      this._c.push(reaction);
	      if (this._a) this._a.push(reaction);
	      if (this._s) notify(this, false);
	      return reaction.promise;
	    },
	    // 25.4.5.1 Promise.prototype.catch(onRejected)
	    'catch': function (onRejected) {
	      return this.then(undefined, onRejected);
	    }
	  });
	  OwnPromiseCapability = function () {
	    var promise = new Internal();
	    this.promise = promise;
	    this.resolve = ctx($resolve, promise, 1);
	    this.reject = ctx($reject, promise, 1);
	  };
	  newPromiseCapabilityModule.f = newPromiseCapability = function (C) {
	    return C === $Promise || C === Wrapper
	      ? new OwnPromiseCapability(C)
	      : newGenericPromiseCapability(C);
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Promise: $Promise });
	__webpack_require__(52)($Promise, PROMISE);
	__webpack_require__(95)(PROMISE);
	Wrapper = __webpack_require__(23)[PROMISE];

	// statics
	$export($export.S + $export.F * !USE_NATIVE, PROMISE, {
	  // 25.4.4.5 Promise.reject(r)
	  reject: function reject(r) {
	    var capability = newPromiseCapability(this);
	    var $$reject = capability.reject;
	    $$reject(r);
	    return capability.promise;
	  }
	});
	$export($export.S + $export.F * (LIBRARY || !USE_NATIVE), PROMISE, {
	  // 25.4.4.6 Promise.resolve(x)
	  resolve: function resolve(x) {
	    return promiseResolve(LIBRARY && this === Wrapper ? $Promise : this, x);
	  }
	});
	$export($export.S + $export.F * !(USE_NATIVE && __webpack_require__(96)(function (iter) {
	  $Promise.all(iter)['catch'](empty);
	})), PROMISE, {
	  // 25.4.4.1 Promise.all(iterable)
	  all: function all(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var resolve = capability.resolve;
	    var reject = capability.reject;
	    var result = perform(function () {
	      var values = [];
	      var index = 0;
	      var remaining = 1;
	      forOf(iterable, false, function (promise) {
	        var $index = index++;
	        var alreadyCalled = false;
	        values.push(undefined);
	        remaining++;
	        C.resolve(promise).then(function (value) {
	          if (alreadyCalled) return;
	          alreadyCalled = true;
	          values[$index] = value;
	          --remaining || resolve(values);
	        }, reject);
	      });
	      --remaining || resolve(values);
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  },
	  // 25.4.4.4 Promise.race(iterable)
	  race: function race(iterable) {
	    var C = this;
	    var capability = newPromiseCapability(C);
	    var reject = capability.reject;
	    var result = perform(function () {
	      forOf(iterable, false, function (promise) {
	        C.resolve(promise).then(capability.resolve, reject);
	      });
	    });
	    if (result.e) reject(result.v);
	    return capability.promise;
	  }
	});


/***/ }),
/* 83 */
/***/ (function(module, exports) {

	module.exports = function (it, Constructor, name, forbiddenField) {
	  if (!(it instanceof Constructor) || (forbiddenField !== undefined && forbiddenField in it)) {
	    throw TypeError(name + ': incorrect invocation!');
	  } return it;
	};


/***/ }),
/* 84 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(24);
	var call = __webpack_require__(85);
	var isArrayIter = __webpack_require__(86);
	var anObject = __webpack_require__(28);
	var toLength = __webpack_require__(44);
	var getIterFn = __webpack_require__(59);
	var BREAK = {};
	var RETURN = {};
	var exports = module.exports = function (iterable, entries, fn, that, ITERATOR) {
	  var iterFn = ITERATOR ? function () { return iterable; } : getIterFn(iterable);
	  var f = ctx(fn, that, entries ? 2 : 1);
	  var index = 0;
	  var length, step, iterator, result;
	  if (typeof iterFn != 'function') throw TypeError(iterable + ' is not iterable!');
	  // fast case for arrays with default iterator
	  if (isArrayIter(iterFn)) for (length = toLength(iterable.length); length > index; index++) {
	    result = entries ? f(anObject(step = iterable[index])[0], step[1]) : f(iterable[index]);
	    if (result === BREAK || result === RETURN) return result;
	  } else for (iterator = iterFn.call(iterable); !(step = iterator.next()).done;) {
	    result = call(iterator, f, step.value, entries);
	    if (result === BREAK || result === RETURN) return result;
	  }
	};
	exports.BREAK = BREAK;
	exports.RETURN = RETURN;


/***/ }),
/* 85 */
/***/ (function(module, exports, __webpack_require__) {

	// call something on iterator step with safe closing on error
	var anObject = __webpack_require__(28);
	module.exports = function (iterator, fn, value, entries) {
	  try {
	    return entries ? fn(anObject(value)[0], value[1]) : fn(value);
	  // 7.4.6 IteratorClose(iterator, completion)
	  } catch (e) {
	    var ret = iterator['return'];
	    if (ret !== undefined) anObject(ret.call(iterator));
	    throw e;
	  }
	};


/***/ }),
/* 86 */
/***/ (function(module, exports, __webpack_require__) {

	// check on default Array iterator
	var Iterators = __webpack_require__(14);
	var ITERATOR = __webpack_require__(53)('iterator');
	var ArrayProto = Array.prototype;

	module.exports = function (it) {
	  return it !== undefined && (Iterators.Array === it || ArrayProto[ITERATOR] === it);
	};


/***/ }),
/* 87 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.3.20 SpeciesConstructor(O, defaultConstructor)
	var anObject = __webpack_require__(28);
	var aFunction = __webpack_require__(25);
	var SPECIES = __webpack_require__(53)('species');
	module.exports = function (O, D) {
	  var C = anObject(O).constructor;
	  var S;
	  return C === undefined || (S = anObject(C)[SPECIES]) == undefined ? D : aFunction(S);
	};


/***/ }),
/* 88 */
/***/ (function(module, exports, __webpack_require__) {

	var ctx = __webpack_require__(24);
	var invoke = __webpack_require__(89);
	var html = __webpack_require__(51);
	var cel = __webpack_require__(33);
	var global = __webpack_require__(22);
	var process = global.process;
	var setTask = global.setImmediate;
	var clearTask = global.clearImmediate;
	var MessageChannel = global.MessageChannel;
	var Dispatch = global.Dispatch;
	var counter = 0;
	var queue = {};
	var ONREADYSTATECHANGE = 'onreadystatechange';
	var defer, channel, port;
	var run = function () {
	  var id = +this;
	  // eslint-disable-next-line no-prototype-builtins
	  if (queue.hasOwnProperty(id)) {
	    var fn = queue[id];
	    delete queue[id];
	    fn();
	  }
	};
	var listener = function (event) {
	  run.call(event.data);
	};
	// Node.js 0.9+ & IE10+ has setImmediate, otherwise:
	if (!setTask || !clearTask) {
	  setTask = function setImmediate(fn) {
	    var args = [];
	    var i = 1;
	    while (arguments.length > i) args.push(arguments[i++]);
	    queue[++counter] = function () {
	      // eslint-disable-next-line no-new-func
	      invoke(typeof fn == 'function' ? fn : Function(fn), args);
	    };
	    defer(counter);
	    return counter;
	  };
	  clearTask = function clearImmediate(id) {
	    delete queue[id];
	  };
	  // Node.js 0.8-
	  if (__webpack_require__(17)(process) == 'process') {
	    defer = function (id) {
	      process.nextTick(ctx(run, id, 1));
	    };
	  // Sphere (JS game engine) Dispatch API
	  } else if (Dispatch && Dispatch.now) {
	    defer = function (id) {
	      Dispatch.now(ctx(run, id, 1));
	    };
	  // Browsers with MessageChannel, includes WebWorkers
	  } else if (MessageChannel) {
	    channel = new MessageChannel();
	    port = channel.port2;
	    channel.port1.onmessage = listener;
	    defer = ctx(port.postMessage, port, 1);
	  // Browsers with postMessage, skip WebWorkers
	  // IE8 has postMessage, but it's sync & typeof its postMessage is 'object'
	  } else if (global.addEventListener && typeof postMessage == 'function' && !global.importScripts) {
	    defer = function (id) {
	      global.postMessage(id + '', '*');
	    };
	    global.addEventListener('message', listener, false);
	  // IE8-
	  } else if (ONREADYSTATECHANGE in cel('script')) {
	    defer = function (id) {
	      html.appendChild(cel('script'))[ONREADYSTATECHANGE] = function () {
	        html.removeChild(this);
	        run.call(id);
	      };
	    };
	  // Rest old browsers
	  } else {
	    defer = function (id) {
	      setTimeout(ctx(run, id, 1), 0);
	    };
	  }
	}
	module.exports = {
	  set: setTask,
	  clear: clearTask
	};


/***/ }),
/* 89 */
/***/ (function(module, exports) {

	// fast apply, http://jsperf.lnkit.com/fast-apply/5
	module.exports = function (fn, args, that) {
	  var un = that === undefined;
	  switch (args.length) {
	    case 0: return un ? fn()
	                      : fn.call(that);
	    case 1: return un ? fn(args[0])
	                      : fn.call(that, args[0]);
	    case 2: return un ? fn(args[0], args[1])
	                      : fn.call(that, args[0], args[1]);
	    case 3: return un ? fn(args[0], args[1], args[2])
	                      : fn.call(that, args[0], args[1], args[2]);
	    case 4: return un ? fn(args[0], args[1], args[2], args[3])
	                      : fn.call(that, args[0], args[1], args[2], args[3]);
	  } return fn.apply(that, args);
	};


/***/ }),
/* 90 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(22);
	var macrotask = __webpack_require__(88).set;
	var Observer = global.MutationObserver || global.WebKitMutationObserver;
	var process = global.process;
	var Promise = global.Promise;
	var isNode = __webpack_require__(17)(process) == 'process';

	module.exports = function () {
	  var head, last, notify;

	  var flush = function () {
	    var parent, fn;
	    if (isNode && (parent = process.domain)) parent.exit();
	    while (head) {
	      fn = head.fn;
	      head = head.next;
	      try {
	        fn();
	      } catch (e) {
	        if (head) notify();
	        else last = undefined;
	        throw e;
	      }
	    } last = undefined;
	    if (parent) parent.enter();
	  };

	  // Node.js
	  if (isNode) {
	    notify = function () {
	      process.nextTick(flush);
	    };
	  // browsers with MutationObserver
	  } else if (Observer) {
	    var toggle = true;
	    var node = document.createTextNode('');
	    new Observer(flush).observe(node, { characterData: true }); // eslint-disable-line no-new
	    notify = function () {
	      node.data = toggle = !toggle;
	    };
	  // environments with maybe non-completely correct, but existent Promise
	  } else if (Promise && Promise.resolve) {
	    var promise = Promise.resolve();
	    notify = function () {
	      promise.then(flush);
	    };
	  // for other environments - macrotask based on:
	  // - setImmediate
	  // - MessageChannel
	  // - window.postMessag
	  // - onreadystatechange
	  // - setTimeout
	  } else {
	    notify = function () {
	      // strange IE + webpack dev server bug - use .call(global)
	      macrotask.call(global, flush);
	    };
	  }

	  return function (fn) {
	    var task = { fn: fn, next: undefined };
	    if (last) last.next = task;
	    if (!head) {
	      head = task;
	      notify();
	    } last = task;
	  };
	};


/***/ }),
/* 91 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// 25.4.1.5 NewPromiseCapability(C)
	var aFunction = __webpack_require__(25);

	function PromiseCapability(C) {
	  var resolve, reject;
	  this.promise = new C(function ($$resolve, $$reject) {
	    if (resolve !== undefined || reject !== undefined) throw TypeError('Bad Promise constructor');
	    resolve = $$resolve;
	    reject = $$reject;
	  });
	  this.resolve = aFunction(resolve);
	  this.reject = aFunction(reject);
	}

	module.exports.f = function (C) {
	  return new PromiseCapability(C);
	};


/***/ }),
/* 92 */
/***/ (function(module, exports) {

	module.exports = function (exec) {
	  try {
	    return { e: false, v: exec() };
	  } catch (e) {
	    return { e: true, v: e };
	  }
	};


/***/ }),
/* 93 */
/***/ (function(module, exports, __webpack_require__) {

	var anObject = __webpack_require__(28);
	var isObject = __webpack_require__(29);
	var newPromiseCapability = __webpack_require__(91);

	module.exports = function (C, x) {
	  anObject(C);
	  if (isObject(x) && x.constructor === C) return x;
	  var promiseCapability = newPromiseCapability.f(C);
	  var resolve = promiseCapability.resolve;
	  resolve(x);
	  return promiseCapability.promise;
	};


/***/ }),
/* 94 */
/***/ (function(module, exports, __webpack_require__) {

	var hide = __webpack_require__(26);
	module.exports = function (target, src, safe) {
	  for (var key in src) {
	    if (safe && target[key]) target[key] = src[key];
	    else hide(target, key, src[key]);
	  } return target;
	};


/***/ }),
/* 95 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	var global = __webpack_require__(22);
	var core = __webpack_require__(23);
	var dP = __webpack_require__(27);
	var DESCRIPTORS = __webpack_require__(31);
	var SPECIES = __webpack_require__(53)('species');

	module.exports = function (KEY) {
	  var C = typeof core[KEY] == 'function' ? core[KEY] : global[KEY];
	  if (DESCRIPTORS && C && !C[SPECIES]) dP.f(C, SPECIES, {
	    configurable: true,
	    get: function () { return this; }
	  });
	};


/***/ }),
/* 96 */
/***/ (function(module, exports, __webpack_require__) {

	var ITERATOR = __webpack_require__(53)('iterator');
	var SAFE_CLOSING = false;

	try {
	  var riter = [7][ITERATOR]();
	  riter['return'] = function () { SAFE_CLOSING = true; };
	  // eslint-disable-next-line no-throw-literal
	  Array.from(riter, function () { throw 2; });
	} catch (e) { /* empty */ }

	module.exports = function (exec, skipClosing) {
	  if (!skipClosing && !SAFE_CLOSING) return false;
	  var safe = false;
	  try {
	    var arr = [7];
	    var iter = arr[ITERATOR]();
	    iter.next = function () { return { done: safe = true }; };
	    arr[ITERATOR] = function () { return iter; };
	    exec(arr);
	  } catch (e) { /* empty */ }
	  return safe;
	};


/***/ }),
/* 97 */
/***/ (function(module, exports, __webpack_require__) {

	// https://github.com/tc39/proposal-promise-finally
	'use strict';
	var $export = __webpack_require__(21);
	var core = __webpack_require__(23);
	var global = __webpack_require__(22);
	var speciesConstructor = __webpack_require__(87);
	var promiseResolve = __webpack_require__(93);

	$export($export.P + $export.R, 'Promise', { 'finally': function (onFinally) {
	  var C = speciesConstructor(this, core.Promise || global.Promise);
	  var isFunction = typeof onFinally == 'function';
	  return this.then(
	    isFunction ? function (x) {
	      return promiseResolve(C, onFinally()).then(function () { return x; });
	    } : onFinally,
	    isFunction ? function (e) {
	      return promiseResolve(C, onFinally()).then(function () { throw e; });
	    } : onFinally
	  );
	} });


/***/ }),
/* 98 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// https://github.com/tc39/proposal-promise-try
	var $export = __webpack_require__(21);
	var newPromiseCapability = __webpack_require__(91);
	var perform = __webpack_require__(92);

	$export($export.S, 'Promise', { 'try': function (callbackfn) {
	  var promiseCapability = newPromiseCapability.f(this);
	  var result = perform(callbackfn);
	  (result.e ? promiseCapability.reject : promiseCapability.resolve)(result.v);
	  return promiseCapability.promise;
	} });


/***/ }),
/* 99 */
/***/ (function(module, exports, __webpack_require__) {

	"use strict";

	exports.__esModule = true;

	var _iterator = __webpack_require__(100);

	var _iterator2 = _interopRequireDefault(_iterator);

	var _symbol = __webpack_require__(103);

	var _symbol2 = _interopRequireDefault(_symbol);

	var _typeof = typeof _symbol2.default === "function" && typeof _iterator2.default === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj; };

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	exports.default = typeof _symbol2.default === "function" && _typeof(_iterator2.default) === "symbol" ? function (obj) {
	  return typeof obj === "undefined" ? "undefined" : _typeof(obj);
	} : function (obj) {
	  return obj && typeof _symbol2.default === "function" && obj.constructor === _symbol2.default && obj !== _symbol2.default.prototype ? "symbol" : typeof obj === "undefined" ? "undefined" : _typeof(obj);
	};

/***/ }),
/* 100 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(101), __esModule: true };

/***/ }),
/* 101 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(56);
	__webpack_require__(10);
	module.exports = __webpack_require__(102).f('iterator');


/***/ }),
/* 102 */
/***/ (function(module, exports, __webpack_require__) {

	exports.f = __webpack_require__(53);


/***/ }),
/* 103 */
/***/ (function(module, exports, __webpack_require__) {

	module.exports = { "default": __webpack_require__(104), __esModule: true };

/***/ }),
/* 104 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(105);
	__webpack_require__(81);
	__webpack_require__(113);
	__webpack_require__(114);
	module.exports = __webpack_require__(23).Symbol;


/***/ }),
/* 105 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';
	// ECMAScript 6 symbols shim
	var global = __webpack_require__(22);
	var has = __webpack_require__(37);
	var DESCRIPTORS = __webpack_require__(31);
	var $export = __webpack_require__(21);
	var redefine = __webpack_require__(36);
	var META = __webpack_require__(106).KEY;
	var $fails = __webpack_require__(32);
	var shared = __webpack_require__(48);
	var setToStringTag = __webpack_require__(52);
	var uid = __webpack_require__(49);
	var wks = __webpack_require__(53);
	var wksExt = __webpack_require__(102);
	var wksDefine = __webpack_require__(107);
	var enumKeys = __webpack_require__(108);
	var isArray = __webpack_require__(109);
	var anObject = __webpack_require__(28);
	var toIObject = __webpack_require__(15);
	var toPrimitive = __webpack_require__(34);
	var createDesc = __webpack_require__(35);
	var _create = __webpack_require__(39);
	var gOPNExt = __webpack_require__(110);
	var $GOPD = __webpack_require__(112);
	var $DP = __webpack_require__(27);
	var $keys = __webpack_require__(41);
	var gOPD = $GOPD.f;
	var dP = $DP.f;
	var gOPN = gOPNExt.f;
	var $Symbol = global.Symbol;
	var $JSON = global.JSON;
	var _stringify = $JSON && $JSON.stringify;
	var PROTOTYPE = 'prototype';
	var HIDDEN = wks('_hidden');
	var TO_PRIMITIVE = wks('toPrimitive');
	var isEnum = {}.propertyIsEnumerable;
	var SymbolRegistry = shared('symbol-registry');
	var AllSymbols = shared('symbols');
	var OPSymbols = shared('op-symbols');
	var ObjectProto = Object[PROTOTYPE];
	var USE_NATIVE = typeof $Symbol == 'function';
	var QObject = global.QObject;
	// Don't use setters in Qt Script, https://github.com/zloirock/core-js/issues/173
	var setter = !QObject || !QObject[PROTOTYPE] || !QObject[PROTOTYPE].findChild;

	// fallback for old Android, https://code.google.com/p/v8/issues/detail?id=687
	var setSymbolDesc = DESCRIPTORS && $fails(function () {
	  return _create(dP({}, 'a', {
	    get: function () { return dP(this, 'a', { value: 7 }).a; }
	  })).a != 7;
	}) ? function (it, key, D) {
	  var protoDesc = gOPD(ObjectProto, key);
	  if (protoDesc) delete ObjectProto[key];
	  dP(it, key, D);
	  if (protoDesc && it !== ObjectProto) dP(ObjectProto, key, protoDesc);
	} : dP;

	var wrap = function (tag) {
	  var sym = AllSymbols[tag] = _create($Symbol[PROTOTYPE]);
	  sym._k = tag;
	  return sym;
	};

	var isSymbol = USE_NATIVE && typeof $Symbol.iterator == 'symbol' ? function (it) {
	  return typeof it == 'symbol';
	} : function (it) {
	  return it instanceof $Symbol;
	};

	var $defineProperty = function defineProperty(it, key, D) {
	  if (it === ObjectProto) $defineProperty(OPSymbols, key, D);
	  anObject(it);
	  key = toPrimitive(key, true);
	  anObject(D);
	  if (has(AllSymbols, key)) {
	    if (!D.enumerable) {
	      if (!has(it, HIDDEN)) dP(it, HIDDEN, createDesc(1, {}));
	      it[HIDDEN][key] = true;
	    } else {
	      if (has(it, HIDDEN) && it[HIDDEN][key]) it[HIDDEN][key] = false;
	      D = _create(D, { enumerable: createDesc(0, false) });
	    } return setSymbolDesc(it, key, D);
	  } return dP(it, key, D);
	};
	var $defineProperties = function defineProperties(it, P) {
	  anObject(it);
	  var keys = enumKeys(P = toIObject(P));
	  var i = 0;
	  var l = keys.length;
	  var key;
	  while (l > i) $defineProperty(it, key = keys[i++], P[key]);
	  return it;
	};
	var $create = function create(it, P) {
	  return P === undefined ? _create(it) : $defineProperties(_create(it), P);
	};
	var $propertyIsEnumerable = function propertyIsEnumerable(key) {
	  var E = isEnum.call(this, key = toPrimitive(key, true));
	  if (this === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return false;
	  return E || !has(this, key) || !has(AllSymbols, key) || has(this, HIDDEN) && this[HIDDEN][key] ? E : true;
	};
	var $getOwnPropertyDescriptor = function getOwnPropertyDescriptor(it, key) {
	  it = toIObject(it);
	  key = toPrimitive(key, true);
	  if (it === ObjectProto && has(AllSymbols, key) && !has(OPSymbols, key)) return;
	  var D = gOPD(it, key);
	  if (D && has(AllSymbols, key) && !(has(it, HIDDEN) && it[HIDDEN][key])) D.enumerable = true;
	  return D;
	};
	var $getOwnPropertyNames = function getOwnPropertyNames(it) {
	  var names = gOPN(toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (!has(AllSymbols, key = names[i++]) && key != HIDDEN && key != META) result.push(key);
	  } return result;
	};
	var $getOwnPropertySymbols = function getOwnPropertySymbols(it) {
	  var IS_OP = it === ObjectProto;
	  var names = gOPN(IS_OP ? OPSymbols : toIObject(it));
	  var result = [];
	  var i = 0;
	  var key;
	  while (names.length > i) {
	    if (has(AllSymbols, key = names[i++]) && (IS_OP ? has(ObjectProto, key) : true)) result.push(AllSymbols[key]);
	  } return result;
	};

	// 19.4.1.1 Symbol([description])
	if (!USE_NATIVE) {
	  $Symbol = function Symbol() {
	    if (this instanceof $Symbol) throw TypeError('Symbol is not a constructor!');
	    var tag = uid(arguments.length > 0 ? arguments[0] : undefined);
	    var $set = function (value) {
	      if (this === ObjectProto) $set.call(OPSymbols, value);
	      if (has(this, HIDDEN) && has(this[HIDDEN], tag)) this[HIDDEN][tag] = false;
	      setSymbolDesc(this, tag, createDesc(1, value));
	    };
	    if (DESCRIPTORS && setter) setSymbolDesc(ObjectProto, tag, { configurable: true, set: $set });
	    return wrap(tag);
	  };
	  redefine($Symbol[PROTOTYPE], 'toString', function toString() {
	    return this._k;
	  });

	  $GOPD.f = $getOwnPropertyDescriptor;
	  $DP.f = $defineProperty;
	  __webpack_require__(111).f = gOPNExt.f = $getOwnPropertyNames;
	  __webpack_require__(70).f = $propertyIsEnumerable;
	  __webpack_require__(69).f = $getOwnPropertySymbols;

	  if (DESCRIPTORS && !__webpack_require__(20)) {
	    redefine(ObjectProto, 'propertyIsEnumerable', $propertyIsEnumerable, true);
	  }

	  wksExt.f = function (name) {
	    return wrap(wks(name));
	  };
	}

	$export($export.G + $export.W + $export.F * !USE_NATIVE, { Symbol: $Symbol });

	for (var es6Symbols = (
	  // 19.4.2.2, 19.4.2.3, 19.4.2.4, 19.4.2.6, 19.4.2.8, 19.4.2.9, 19.4.2.10, 19.4.2.11, 19.4.2.12, 19.4.2.13, 19.4.2.14
	  'hasInstance,isConcatSpreadable,iterator,match,replace,search,species,split,toPrimitive,toStringTag,unscopables'
	).split(','), j = 0; es6Symbols.length > j;)wks(es6Symbols[j++]);

	for (var wellKnownSymbols = $keys(wks.store), k = 0; wellKnownSymbols.length > k;) wksDefine(wellKnownSymbols[k++]);

	$export($export.S + $export.F * !USE_NATIVE, 'Symbol', {
	  // 19.4.2.1 Symbol.for(key)
	  'for': function (key) {
	    return has(SymbolRegistry, key += '')
	      ? SymbolRegistry[key]
	      : SymbolRegistry[key] = $Symbol(key);
	  },
	  // 19.4.2.5 Symbol.keyFor(sym)
	  keyFor: function keyFor(sym) {
	    if (!isSymbol(sym)) throw TypeError(sym + ' is not a symbol!');
	    for (var key in SymbolRegistry) if (SymbolRegistry[key] === sym) return key;
	  },
	  useSetter: function () { setter = true; },
	  useSimple: function () { setter = false; }
	});

	$export($export.S + $export.F * !USE_NATIVE, 'Object', {
	  // 19.1.2.2 Object.create(O [, Properties])
	  create: $create,
	  // 19.1.2.4 Object.defineProperty(O, P, Attributes)
	  defineProperty: $defineProperty,
	  // 19.1.2.3 Object.defineProperties(O, Properties)
	  defineProperties: $defineProperties,
	  // 19.1.2.6 Object.getOwnPropertyDescriptor(O, P)
	  getOwnPropertyDescriptor: $getOwnPropertyDescriptor,
	  // 19.1.2.7 Object.getOwnPropertyNames(O)
	  getOwnPropertyNames: $getOwnPropertyNames,
	  // 19.1.2.8 Object.getOwnPropertySymbols(O)
	  getOwnPropertySymbols: $getOwnPropertySymbols
	});

	// 24.3.2 JSON.stringify(value [, replacer [, space]])
	$JSON && $export($export.S + $export.F * (!USE_NATIVE || $fails(function () {
	  var S = $Symbol();
	  // MS Edge converts symbol values to JSON as {}
	  // WebKit converts symbol values to JSON as null
	  // V8 throws on boxed symbols
	  return _stringify([S]) != '[null]' || _stringify({ a: S }) != '{}' || _stringify(Object(S)) != '{}';
	})), 'JSON', {
	  stringify: function stringify(it) {
	    if (it === undefined || isSymbol(it)) return; // IE8 returns string on undefined
	    var args = [it];
	    var i = 1;
	    var replacer, $replacer;
	    while (arguments.length > i) args.push(arguments[i++]);
	    replacer = args[1];
	    if (typeof replacer == 'function') $replacer = replacer;
	    if ($replacer || !isArray(replacer)) replacer = function (key, value) {
	      if ($replacer) value = $replacer.call(this, key, value);
	      if (!isSymbol(value)) return value;
	    };
	    args[1] = replacer;
	    return _stringify.apply($JSON, args);
	  }
	});

	// 19.4.3.4 Symbol.prototype[@@toPrimitive](hint)
	$Symbol[PROTOTYPE][TO_PRIMITIVE] || __webpack_require__(26)($Symbol[PROTOTYPE], TO_PRIMITIVE, $Symbol[PROTOTYPE].valueOf);
	// 19.4.3.5 Symbol.prototype[@@toStringTag]
	setToStringTag($Symbol, 'Symbol');
	// 20.2.1.9 Math[@@toStringTag]
	setToStringTag(Math, 'Math', true);
	// 24.3.3 JSON[@@toStringTag]
	setToStringTag(global.JSON, 'JSON', true);


/***/ }),
/* 106 */
/***/ (function(module, exports, __webpack_require__) {

	var META = __webpack_require__(49)('meta');
	var isObject = __webpack_require__(29);
	var has = __webpack_require__(37);
	var setDesc = __webpack_require__(27).f;
	var id = 0;
	var isExtensible = Object.isExtensible || function () {
	  return true;
	};
	var FREEZE = !__webpack_require__(32)(function () {
	  return isExtensible(Object.preventExtensions({}));
	});
	var setMeta = function (it) {
	  setDesc(it, META, { value: {
	    i: 'O' + ++id, // object ID
	    w: {}          // weak collections IDs
	  } });
	};
	var fastKey = function (it, create) {
	  // return primitive with prefix
	  if (!isObject(it)) return typeof it == 'symbol' ? it : (typeof it == 'string' ? 'S' : 'P') + it;
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return 'F';
	    // not necessary to add metadata
	    if (!create) return 'E';
	    // add missing metadata
	    setMeta(it);
	  // return object ID
	  } return it[META].i;
	};
	var getWeak = function (it, create) {
	  if (!has(it, META)) {
	    // can't set metadata to uncaught frozen object
	    if (!isExtensible(it)) return true;
	    // not necessary to add metadata
	    if (!create) return false;
	    // add missing metadata
	    setMeta(it);
	  // return hash weak collections IDs
	  } return it[META].w;
	};
	// add metadata on freeze-family methods calling
	var onFreeze = function (it) {
	  if (FREEZE && meta.NEED && isExtensible(it) && !has(it, META)) setMeta(it);
	  return it;
	};
	var meta = module.exports = {
	  KEY: META,
	  NEED: false,
	  fastKey: fastKey,
	  getWeak: getWeak,
	  onFreeze: onFreeze
	};


/***/ }),
/* 107 */
/***/ (function(module, exports, __webpack_require__) {

	var global = __webpack_require__(22);
	var core = __webpack_require__(23);
	var LIBRARY = __webpack_require__(20);
	var wksExt = __webpack_require__(102);
	var defineProperty = __webpack_require__(27).f;
	module.exports = function (name) {
	  var $Symbol = core.Symbol || (core.Symbol = LIBRARY ? {} : global.Symbol || {});
	  if (name.charAt(0) != '_' && !(name in $Symbol)) defineProperty($Symbol, name, { value: wksExt.f(name) });
	};


/***/ }),
/* 108 */
/***/ (function(module, exports, __webpack_require__) {

	// all enumerable object keys, includes symbols
	var getKeys = __webpack_require__(41);
	var gOPS = __webpack_require__(69);
	var pIE = __webpack_require__(70);
	module.exports = function (it) {
	  var result = getKeys(it);
	  var getSymbols = gOPS.f;
	  if (getSymbols) {
	    var symbols = getSymbols(it);
	    var isEnum = pIE.f;
	    var i = 0;
	    var key;
	    while (symbols.length > i) if (isEnum.call(it, key = symbols[i++])) result.push(key);
	  } return result;
	};


/***/ }),
/* 109 */
/***/ (function(module, exports, __webpack_require__) {

	// 7.2.2 IsArray(argument)
	var cof = __webpack_require__(17);
	module.exports = Array.isArray || function isArray(arg) {
	  return cof(arg) == 'Array';
	};


/***/ }),
/* 110 */
/***/ (function(module, exports, __webpack_require__) {

	// fallback for IE11 buggy Object.getOwnPropertyNames with iframe and window
	var toIObject = __webpack_require__(15);
	var gOPN = __webpack_require__(111).f;
	var toString = {}.toString;

	var windowNames = typeof window == 'object' && window && Object.getOwnPropertyNames
	  ? Object.getOwnPropertyNames(window) : [];

	var getWindowNames = function (it) {
	  try {
	    return gOPN(it);
	  } catch (e) {
	    return windowNames.slice();
	  }
	};

	module.exports.f = function getOwnPropertyNames(it) {
	  return windowNames && toString.call(it) == '[object Window]' ? getWindowNames(it) : gOPN(toIObject(it));
	};


/***/ }),
/* 111 */
/***/ (function(module, exports, __webpack_require__) {

	// 19.1.2.7 / 15.2.3.4 Object.getOwnPropertyNames(O)
	var $keys = __webpack_require__(42);
	var hiddenKeys = __webpack_require__(50).concat('length', 'prototype');

	exports.f = Object.getOwnPropertyNames || function getOwnPropertyNames(O) {
	  return $keys(O, hiddenKeys);
	};


/***/ }),
/* 112 */
/***/ (function(module, exports, __webpack_require__) {

	var pIE = __webpack_require__(70);
	var createDesc = __webpack_require__(35);
	var toIObject = __webpack_require__(15);
	var toPrimitive = __webpack_require__(34);
	var has = __webpack_require__(37);
	var IE8_DOM_DEFINE = __webpack_require__(30);
	var gOPD = Object.getOwnPropertyDescriptor;

	exports.f = __webpack_require__(31) ? gOPD : function getOwnPropertyDescriptor(O, P) {
	  O = toIObject(O);
	  P = toPrimitive(P, true);
	  if (IE8_DOM_DEFINE) try {
	    return gOPD(O, P);
	  } catch (e) { /* empty */ }
	  if (has(O, P)) return createDesc(!pIE.f.call(O, P), O[P]);
	};


/***/ }),
/* 113 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(107)('asyncIterator');


/***/ }),
/* 114 */
/***/ (function(module, exports, __webpack_require__) {

	__webpack_require__(107)('observable');


/***/ }),
/* 115 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.installSanHook = installSanHook;
	/**
	 * San DevTool
	 * Copyright 2017 Ecomfe. All rights reserved.
	 *
	 * @file 向页面注入挂钩，__san_devtool__ 为根节点。
	 */

	function installSanHook(global) {
	    if (global[("__san_devtool__")]) {
	        return;
	    }
	    var sanHook = {
	        _listeners: {},
	        // 是否为第一次触发。
	        _initialEmitting: false,
	        // 判断 devtool 面板是否打开。
	        _devtoolPanelCreated: false,
	        // 判定此挂钩的运行上下文。
	        _this: null,
	        // 由 San 传入的 san 对象。
	        san: null,
	        // 与 devtool 保持同步的组件树。
	        data: {
	            treeData: []
	        },
	        // 记录 San devtool 事件触发列表。
	        history: [],
	        historyIndexBeforeDevtoolPanelCreated: 0,
	        routes: [],
	        sub: function sub(event, func) {
	            sanHook.on(event, func);
	            return function () {
	                return sanHook.off(event, func);
	            };
	        },
	        on: function on(event, func) {
	            if (!sanHook._listeners[event]) {
	                sanHook._listeners[event] = [];
	            }
	            sanHook._listeners[event].push(func);
	        },
	        off: function off(event, func) {
	            if (!sanHook._listeners[event]) {
	                return;
	            }
	            var index = sanHook._listeners[event].indexOf(func);
	            if (index !== -1) {
	                sanHook._listeners[event].splice(index, 1);
	            }
	            if (!sanHook._listeners[event].length) {
	                sanHook._listeners[event] = null;
	            }
	        },
	        emit: function emit(event, data) {
	            // 兼容 San 3.1.3 以前的版本。在 3.1.3 之后仅挂在到 window 对象上。
	            if (!sanHook._initialEmitting && event === 'san') {
	                if (sanHook._this === window) {
	                    delete Object.prototype[("__san_devtool__")];
	                }
	                sanHook._initialEmitting = true;
	            }
	            if (sanHook._listeners[event]) {
	                sanHook._listeners[event].map(function (func) {
	                    return func(data);
	                });
	            }
	        }
	    };

	    sanHook.on('san', function (san) {
	        if (!sanHook.san && san) {
	            sanHook.san = san;
	            console.log('San is hooked, version is ' + san.version);
	        };
	    });

	    // FIXME
	    var defineProperty = {}.constructor.defineProperty;
	    var hookAccessor = {
	        configurable: true,
	        get: function get() {
	            sanHook._this = this;
	            return sanHook;
	        }
	    };
	    defineProperty(Object.prototype, ("__san_devtool__"), hookAccessor);
	    defineProperty(window.constructor.prototype, ("__san_devtool__"), hookAccessor);

	    var devtoolPanelCreatedAccessor = {
	        configurable: true,
	        get: function get() {
	            return sanHook._devtoolPanelCreated;
	        },
	        set: function set(value) {
	            sanHook._devtoolPanelCreated = !!value;
	            sanHook.historyIndexBeforeDevtoolPanelCreated = sanHook.history.length;
	            console.log('devtool panel created');
	        }
	    };
	    defineProperty(sanHook, 'devtoolPanelCreated', devtoolPanelCreatedAccessor);
	}

/***/ }),
/* 116 */
/***/ (function(module, exports, __webpack_require__) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});

	var _chromeExtMessenger = __webpack_require__(1);

	var _chromeExtMessenger2 = _interopRequireDefault(_chromeExtMessenger);

	var _highlighter = __webpack_require__(62);

	var _highlighter2 = _interopRequireDefault(_highlighter);

	var _utils = __webpack_require__(7);

	var _utils2 = _interopRequireDefault(_utils);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var messenger = new _chromeExtMessenger2.default(); /**
	                                                     * San DevTool
	                                                     * Copyright 2017 Ecomfe. All rights reserved.
	                                                     *
	                                                     * @file Interchange station for page context and content script context.
	                                                     */

	var c = messenger.initConnection('interchange', function () {});

	function init() {
	    window.addEventListener('message', function (e) {
	        var eventData = e.data;
	        if (!eventData) {
	            return;
	        }
	        var message = eventData.message;
	        if (!message) {
	            return;
	        }
	        // 这几种事件暂时不向 devtool 发送，仅用于更新 history。
	        if (message === 'comp-compiled' || message === 'comp-inited' || message === 'comp-created' || message === 'comp-disposed') {
	            return;
	        }
	        // san-router 消息单独处理。
	        if (message === 'comp-route') {
	            postRouteMessageToDevtool(eventData);
	            return;
	        }
	        // Component 的 7 种事件。
	        if (message.startsWith('comp-')) {
	            postSanMessageToDevtool(eventData);
	        }
	    });
	    initHighlightEvent();
	}

	function postSanMessageToDevtool(data) {
	    data.count = _utils2.default.getSanIdElementCount();
	    c.sendMessage('devtool:component_tree', data, function () {});
	}

	function postRouteMessageToDevtool(data) {
	    c.sendMessage('devtool:routes', data, function () {});
	}

	function initHighlightEvent() {
	    var messenger = new _chromeExtMessenger2.default();
	    var highlightConnector = messenger.initConnection('highlight_dom', function (message, from, sender, sendResponse) {
	        var id = message.id;
	        _highlighter2.default.highlight(document.getElementById(id));
	    });
	    var unhighlightConnector = messenger.initConnection('unhighlight_dom', function (message, from, sender, sendResponse) {
	        _highlighter2.default.unhighlight();
	    });
	}

	exports.default = {
	    init: init
	};

/***/ })
/******/ ]);