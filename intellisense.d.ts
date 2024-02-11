interface Patch {
    preload: boolean;
    patch: () => void;
}

interface NWCompat {
    // Native
    getDataDirectory: () => string;
    getGameDirectory: () => string;
    getKey: () => string;

    fsReadFile: (path: string) => string | undefined;
    fsWriteFile: (path: string, data: unknown[]) => void;

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

    achievements: string[];
    createAchievementElement: (name: string, description: string, icon: string, id: string) => HTMLDivElement;
}

interface Window {
    nwcompat: NWCompat;
}

declare const nwcompat: NWCompat;
