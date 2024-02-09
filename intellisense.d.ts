interface Patch {
    preload: boolean;
    patch: () => void;
}

interface Awaiter {
    resolve: (value: any) => void;
    reject: (reason: any) => void;
}

interface NWCompat {
    // Native
    asyncCall: (id: number, methodName: string, args: string) => void;

    getDataDirectory: () => string;
    getGameDirectory: () => string;
    getKey: () => string;

    fsReadFile: (path: string) => string | undefined;
    fsWriteFile: (path: string, data: any[]) => void;

    fsReadDir: (path: string) => string[];
    fsMkDir: (path: string) => void;

    fsUnlink: (path: string) => void;
    fsStat: (path: string) => number;
    fsRename: (path: string, newPath: string) => void;

    // Web
    patches: Patch[];
    runPatches: (preload: boolean) => void;

    decoder: TextDecoder;
    encoder: TextEncoder;

    dataDirectory: string;
    gameDirectory: string;

    gamepad: Gamepad;

    async: {
        call: (methodName: string, args: any) => Promise<any>;
        callback: (id: number, success: boolean, result: string) => void;
        awaiters: Map<number, Awaiter>;
    };
}

interface Window {
    nwcompat: NWCompat;
}

declare const nwcompat: NWCompat;
