
/**
 * 更新版本号
 * @param version
 */
// let tabId;
// 获取版本号的方式，选择简单高效的方式： chrome.browserAction.setPopup
// chrome.tabs.query({ active: true, currentWindow: true }, function(tabs) {
//     console.log('tabs[0].id', tabs[0].id);
//     tabId = tabs[0].id || -1;
//     const port = chrome.runtime.connect({
//         name: `popup:${tabId}`
//     });
// });
function getQuery(search: string) {
    let query = {};
    if (search && search.length > 1) {
        let items = search.substring(1).split('&');
        return items.reduce((prev: any, cur: string) => {
            let item = cur.split('=');
            prev[item[0]] = item[1];
            return query;
        }, query);
    }
    return query;
}
document.addEventListener('DOMContentLoaded', update);
function update() {
    let queryArr: Record<string, any>  = getQuery(location.search);
    let version = queryArr.version || '';
    if (typeof version !== 'string' || !version) {
        return false;
    }
    let $v = document.getElementById('version');
    if (!$v) {
        return;
    }

    $v.innerHTML
    = (version.toUpperCase() === 'N/A' ? 'San detected, unknown version.' : `San <b>${version}</b> detected.`)
        + '<br />Please open devtools and click San panel for the detail.';
    let dom: HTMLElement | null = document.querySelector('a img');
    dom && (dom.style.filter = 'none');
    return true;
}