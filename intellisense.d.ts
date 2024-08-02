type PatchStage =
    | "preload" // before any rpgmaker scripts
    | "onload" // window.onload
    | "scriptload"; // every PluginManager.loadScript call (after decryption, before appendChild)

interface PatchScriptData {
    name: string;
    source: string;
}

interface Patch {
    stage: PatchStage;
    name: string;
    patch: (data?: PatchScriptData) => void;
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
    runPatches: (stage: PatchStage, data?: PatchScriptData) => void;

    decoder: TextDecoder;
    encoder: TextEncoder;

    dataDirectory: string;
    gameDirectory: string;

    gamepad: Gamepad;

    achievements: string[];
    createAchievementElement: (name: string, description: string, icon: string, id: string) => HTMLDivElement;
}

type PixiJS = typeof import("pixi.js") & { tilemap: typeof import("@pixi/tilemap") };

interface Window {
    PIXI: PixiJS;
    nwcompat: NWCompat;
}

declare const PIXI: PixiJS;
declare const nwcompat: NWCompat;
