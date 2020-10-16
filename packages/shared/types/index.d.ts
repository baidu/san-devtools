declare namespace Devtools {
    interface Message {
        event: string;
        payload?: any;
        chunk?: any;
        isLast?: boolean;
    }
}

export = Devtools;
