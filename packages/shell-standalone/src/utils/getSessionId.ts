import {nanoid} from 'nanoid';
const key = '$san_devtool';
const sessionStorage = window.sessionStorage;
export default (useCache = true) => {
    let sessionId: string | null;
    if (useCache) {
        sessionId = sessionStorage.getItem(key);
        if (sessionId) {
            return sessionId;
        }
    }

    sessionId = nanoid();
    if (useCache) {
        sessionStorage.setItem(key, sessionId);
    }
    return sessionId;
};
