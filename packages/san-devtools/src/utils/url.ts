import url from 'url';
import getCurrentScriptSource from './getCurrentScriptSource';
import getSessionId from './getSessionId';

export function getUrlFromResourceQuery(resourceQuery: string | undefined) {
    if (!resourceQuery || resourceQuery === '') {
        // Else, get the url from the <script> this file was called with.
        resourceQuery = getCurrentScriptSource() as string;
    }
    return (
        resourceQuery
            // strip leading `?` from query string to get a valid URL
            .substr(1)
            // replace first `&` with `?` to have a valid query string
            .replace('&', '?')
    );
}
export function getUrlPartsFromQuery(resourceQuery: string | undefined) {
    let urlParts: url.UrlWithParsedQuery;
    resourceQuery = getUrlFromResourceQuery(resourceQuery);
    urlParts = url.parse(resourceQuery, true);
    return urlParts;
}

export function createBackendSocketUrl(resourceQuery: string | undefined, currentLocation: any, urlQuery = {}) {
    let urlParts = getUrlPartsFromQuery(resourceQuery);

    if (typeof currentLocation === 'string' && currentLocation !== '') {
        currentLocation = url.parse(currentLocation);
    } else {
        currentLocation = self.location;
    }
    const sessionId = getSessionId();

    return {
        sessionId,
        url: getSocketUrl(urlParts, `/backend/${sessionId}`, urlQuery)
    };
}
export function createFrontendUrl(resourceQuery: string | undefined, sessionId?: string) {
    let url = getUrlFromResourceQuery(resourceQuery);

    if (url.includes('&backendId=')) {
        return url;
    }
    return `${url}&backendId=${sessionId ? sessionId : getSessionId()}`;
}
export function createFrontendSocketUrl(resourceQuery: string | undefined) {
    let urlParts = getUrlPartsFromQuery(resourceQuery);
    return getSocketUrl(urlParts, '/frontend/san', {backendId: (urlParts.query as any).backendId});
}

export function getSocketUrl(urlParts: url.UrlWithParsedQuery, wsPath: string, urlQuery: any) {
    const query = urlParts.query;
    let {hostname, protocol = location.protocol, port} = urlParts;

    const wsHost: string = (query.wsHost || hostname) as string;
    let wsPort: string | null = (query.wsPort as string) || port;

    return url.format({
        protocol: protocol === 'https:' ? 'wss://' : 'ws://',
        hostname: wsHost,
        port: wsPort,
        query: urlQuery,
        // If sockPath is provided it'll be passed in via the resourceQuery as a
        // query param so it has to be parsed out of the querystring in order for the
        // client to open the socket to the correct location.
        pathname: wsPath
    });
}
