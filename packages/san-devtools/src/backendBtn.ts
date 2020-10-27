import bottom from './icons/bottom.svg?inline';
import right from './icons/right.svg?inline';
import drag from './utils/drag';
import EventEmitter from '@shared/EventEmitter';

function storage(payload?: any) {
    if (!window.localStorage) {
        return;
    }
    let storedValue = window.localStorage.getItem('$SAN_DEVTOOLS_IFRAME_STATUS');
    if (typeof payload === 'object') {
        try {
            storedValue = JSON.parse(storedValue as string) || {};
            Object.assign(storedValue, payload);
            window.localStorage.setItem('$SAN_DEVTOOLS_IFRAME_STATUS', JSON.stringify(storedValue));
        }
        catch (e) {
            // do nothing
        }
        return payload;
    }
    // $SAN_DEVTOOLS_IFRAME_STATUS
    let storeds: any = {
        bottomStyle: {
            height: '30vh',
            width: '100%'
        },
        rightStyle: {
            height: '100%',
            width: '50vw',
            right: '0'
        },
        iframeStyle: {
            height: '30vh'
        },
        status: 'bottom'
    };
    if (!storedValue) {
        window.localStorage.setItem('$SAN_DEVTOOLS_IFRAME_STATUS', JSON.stringify(storeds));
    } else {
        try {
            storedValue = JSON.parse(storedValue);
            Object.assign(storeds, storedValue);
        }
        catch (e) {
            // do nothing
        }
    }
    return storeds;
}

let {bottomStyle, rightStyle, iframeStyle, status} = storage();

function openDevtools(popupUrl: string, popupEvent: EventEmitter) {
    let btn: HTMLElement | null = document.getElementById('j-devtools-btn');
    btn && (btn.style.display = 'none');

    const $wrapper = document.createElement('div');
    $wrapper.id = 'j-devtools-wrapper';

    const $toolbar = document.createElement('div');
    $toolbar.classList.add('j-devtools-toolbar');

    const $actionBtn = addActionBtn();

    const $iframeWrapper = document.createElement('div');
    $iframeWrapper.id = 'j-devtools-iframe-wrapper';

    const $iframe = document.createElement('iframe');
    $iframe.id = 'j-devtools-iframe';

    $toolbar.appendChild($actionBtn);
    $wrapper.appendChild($toolbar);
    $iframeWrapper.appendChild($iframe);
    $wrapper.appendChild($iframeWrapper);
    document.body.appendChild($wrapper);
    $iframe.src = popupUrl;
    popupEvent.emit($iframe.contentWindow);
    drag(
        $toolbar,
        () => {
            $iframeWrapper.classList.add('j-devtools-iframe-wrapper-mask');
        },
        (left: number, top: number) => {
            if (status === 'bottom') {
                const height = $wrapper.getBoundingClientRect().height;
                $wrapper.style.height = bottomStyle.height = height - top + 'px';
                $iframe.style.height = iframeStyle.height = height - 28 + 'px';
            }
            else {
                const width = $wrapper.getBoundingClientRect().width;
                $wrapper.style.width = rightStyle.width = width - left + 'px';
                $iframe.style.height = '100%';
            }
        },
        () => {
            $iframeWrapper.classList.remove('j-devtools-iframe-wrapper-mask');
            if (status === 'bottom') {
                storage({bottomStyle});
                storage({iframeStyle});
            }
            else {
                storage({rightStyle});
            }
        }
    );
}

function addActionBtn() {
    const $actionBtn = document.createElement('div');
    $actionBtn.style.background = `url(${right})`;
    $actionBtn.id = 'j-devtools-toolbar-action-btn';
    $actionBtn.addEventListener('click', changePos);
    return $actionBtn;
}

function changePos() {
    let $wrapper: HTMLElement | null = document.getElementById('j-devtools-wrapper');
    let $actionBtn: HTMLElement | null = document.getElementById('j-devtools-toolbar-action-btn');
    let $iframe: HTMLElement | null = document.getElementById('j-devtools-iframe');
    let $toolbar: HTMLElement | null = document.querySelector('.j-devtools-toolbar');
    if (!$wrapper) {
        return;
    }
    if (status === 'bottom') {
        status = 'right';
        $toolbar && ($toolbar.style.cursor = 'ew-resize');
        $actionBtn && ($actionBtn.style.background = `url(${bottom})`);
        $wrapper.style.cssText = Object.entries(rightStyle).map(([key, value]) => `${key}:${value}`).join(';');
        $iframe && ($iframe.style.height = '100%');
        storage({status});
    }
    else if (status === 'right') {
        status = 'bottom';
        $toolbar && ($toolbar.style.cursor = 'ns-resize');
        $actionBtn && ($actionBtn.style.background = `url(${right})`);
        $wrapper.style.cssText = Object.entries(bottomStyle).map(([key, value]) => `${key}:${value}`).join(';');
        $iframe && ($iframe.style.height = iframeStyle.height);
        storage({status});
    }
}

export function addBtn(target: Element, popupUrl: string, popupEvent: EventEmitter) {
    // 判断是否ready。不ready添加domready事件
    const btn = document.createElement('div');
    btn.id = 'j-devtools-btn';
    btn.innerText = 'SanDevtool';
    btn.addEventListener('click', openDevtools.bind(null, popupUrl, popupEvent));
    target.appendChild(btn);
}

export function addStyle(target: Element, style: string) {
    let storeStyle = `
        #j-devtools-wrapper,#j-devtools-iframe{
            height: ${status === 'bottom' ? bottomStyle.height : rightStyle.height};
        }
        #j-devtools-wrapper{
            width: ${status === 'bottom' ? bottomStyle.width : rightStyle.width};
        }
        .j-devtools-toolbar{
            cursor: ${status === 'bottom' ? 'ns-resize' : 'ew-resize'};
        }
    `;
    style += storeStyle;
    const tag: HTMLStyleElement = document.createElement('style');
    target.appendChild(tag);
    tag.appendChild(document.createTextNode(style));
    return tag;
}
