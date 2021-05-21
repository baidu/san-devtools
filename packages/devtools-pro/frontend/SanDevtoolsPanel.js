export class SanDevtoolsPanel extends UI.VBox {
    constructor() {
        super('san_devtools');
        this.registerRequiredCSS('san_devtools/san_devtools.css', {enableLegacyPatching: false});
        this.contentElement.classList.add('html', 'san-devtools');
        this.iframeDom = null;
    }

    wasShown() {
        this._createIFrame();
    }

    willHide() {
        this.contentElement.removeChildren();
        console.log(this.iframeDom.removeChildren());
    }

    // onResize(...args) {
    //     console.log(this.contentElement);
    //     console.log(this);
    // }

    // onLayout(...args) {
    //     console.log(this.contentElement);
    //     console.log(this);
    // }

    // ownerViewDisposed(...args) {
    //     console.log(args);
    // }
    _createIFrame() {
        // 一开始如果进来就执行，那么会存在runtime bridge不存在的情况
        runtime.getBridge().then(bridge => {
            bridge.sendCommand('SanDevtools.getWebsocketUrl').then(a => {
                this.contentElement.removeChildren();
                const iframe = document.createElement('iframe');
                this.iframeDom = iframe;
                iframe.className = 'san-devtools-frame';
                iframe.setAttribute('src', `/san-devtools/san-devtools.html?wsurl=${a.replace(/^ws:/, '')}`);
                iframe.tabIndex = -1;
                UI.ARIAUtils.markAsPresentation(iframe);
                this.contentElement.appendChild(iframe);
            });
        });
    }
}
