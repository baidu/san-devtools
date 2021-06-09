import Bridge from '@shared/Bridge';
import {INSPECT_HIGHLIGHT, INSPECT_UNHIGHLIGHT} from '@shared/protocol';
import {DevToolsHook} from './hook';
import ready from '@shared/utils/ready';

class HighlighterBubble {
    bubble: HTMLElement | null;
    doc: Document;
    currentHighlightedComponentId: string;
    defaultStyle: Record<string, any>;
    unhighlightTimer: NodeJS.Timeout | null;
    constructor(window: Window) {
        this.doc = window.document;
        this.bubble = null;
        this.currentHighlightedComponentId = '';
        this.unhighlightTimer = null;
        this.defaultStyle = {
            'background-color': 'rgba(111, 168, 220, 0.66)',
            'position': 'fixed',
            'z-index': '1000000000000',
            'display': 'none'
        };
        ready(this.init.bind(this));
    }
    init() {
        this.bubble = this.doc.createElement('div');
        let styles = this._getStylesObj(this.defaultStyle);
        this.bubble.id = 'san_devtool_highlighter';
        this.bubble.style.cssText = styles;
        this.doc.addEventListener('click', () => {
            this.unhighlight();
        });
        this.doc.addEventListener('mousemove', () => {
            this.unhighlight();
        });
        this.doc.body.appendChild(this.bubble);
    }
    unhighlight() {
        if (this.unhighlightTimer) {
            this.unhighlightTimer = null;
            this.bubble && (this.bubble.style.display = 'none');
        }
    }
    remove() {
        if (this.bubble && this.bubble.parentNode) {
            this.bubble.parentNode.removeChild(this.bubble);
        }
    }
    highlight(highlightNativeNode: Element) {
        this.unhighlightTimer && clearTimeout(this.unhighlightTimer);
        this.unhighlightTimer = setTimeout(this.unhighlight.bind(this), 1500);
        if (!highlightNativeNode || !this.bubble) {
            return;
        }
        let rect = highlightNativeNode.getBoundingClientRect();
        let newExtraStyle = {
            'left': rect.left + 'px',
            'top': rect.top + 'px',
            'width': rect.width + 'px',
            'height': rect.height + 'px',
            'display': 'block',
            'pointerEvents': 'none'
        };
        this.bubble.style.cssText = this._getStylesObj(this.defaultStyle, newExtraStyle);
    }
    _getStylesObj(baseStyle: Record<string, any> = {}, extraStyle: Record<string, any> = {}) {
        let style = Object.assign(baseStyle, extraStyle);
        return Object.entries(style).reduce((pre: string, [key, val]: string[] = ['', '']) => {
            pre += `${key}:${val};`;
            return pre;
        }, '');
    }
}

export function highlighter(hook: DevToolsHook<{}>, componentId: string, highlighterBubble: HighlighterBubble) {
    if (highlighterBubble.currentHighlightedComponentId === componentId + '') {
        return;
    }
    if (componentId + '') {
        let component = hook.componentMap.get(String(componentId));
        let nativeNode = component?.el;
        if (nativeNode && typeof nativeNode.scrollIntoView === 'function') {
            nativeNode.scrollIntoView({block: 'nearest', inline: 'nearest'});
        }
        highlighterBubble.highlight(nativeNode);
    }
}

export default function setupHighlighter(hook: DevToolsHook<any>, bridge: Bridge, global: any) {
    let highlighterBubble = new HighlighterBubble(global);
    // 组件高亮
    bridge.on(INSPECT_HIGHLIGHT, message => {
        if (!hook.devtoolReady) {
            return;
        }
        highlighter(hook, message, highlighterBubble);
    });
    bridge.on(INSPECT_UNHIGHLIGHT, () => {
        if (!hook.devtoolReady) {
            return;
        }
        highlighterBubble.unhighlight();
    });
}
