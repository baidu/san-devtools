/**
 * San DevTool
 * Copyright 2017 Ecomfe. All rights reserved.
 *
 * @file Highlighter for inspected component 
 */

function init() {
    let highlighter = document.getElementById('san_devtool_highlighter');
    if (highlighter) {
        return highlighter;
    }
    highlighter = document.createElement('div');
    let styles = [
        'background-color: rgba(111, 168, 220, 0.66)',
        'position: fixed',
        'z-index: 1000000000000',
        'display: none'
    ];
    highlighter.id = "san_devtool_highlighter"
    highlighter.style.cssText = styles.join(';');
    document.addEventListener('click', e => {
        unhighlight();
    });
    document.addEventListener('mousemove', e => {
        unhighlight();
    });
    document.body.appendChild(highlighter);
    return highlighter;
}

function final() {
    let highlighter = init();
    if (!highlighter || highlighter.parentElement != document.body) {
        return;
    }
    document.body.removeChild(highlighter);
}

function highlight(el) {
    if (!el) {
        return;
    }
    let rect = el.getBoundingClientRect();
    let highlighter = init();
    highlighter.style.left = rect.left + 'px';
    highlighter.style.top = rect.top + 'px';
    highlighter.style.width = rect.width + 'px';
    highlighter.style.height = rect.height + 'px';
    highlighter.style.display = 'block';
    highlighter.style.pointerEvents = 'none';
}

function unhighlight() {
    let highlighter = init();
    if (highlighter) {
        highlighter.style.display = 'none';
    }
}

export default {
    init,
    final,
    highlight,
    unhighlight
}
