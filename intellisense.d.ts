interface Patch {
    preload: boolean;
    patch: () => void;
}

interface NWCompat {
    // Native
    getDataDirectory: () => string;
    getGameDirectory: () => string;
    getKey: () => string;

    fsStat: (path: string) => number;

    fsReadDir: (path: string) => string[];
    fsMkDir: (path: string) => void;

    fsReadFile: (path: string) => string | undefined;
    fsWriteFile: (path: string, data: unknown[]) => void;

    fsUnlink: (path: string) => void;
    fsRename: (path: string, newPath: string) => void;

    // Web
    patches: Patch[];
    runPatches: (preload: boolean) => void;

    decoder: TextDecoder;
    encoder: TextEncoder;

    dataDirectory: string;
    gameDirectory: string;

    gamepad: Gamepad;
}

interface Window {
    nwcompat: NWCompat;
}

declare const nwcompat: NWCompat;
