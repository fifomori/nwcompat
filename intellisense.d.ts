type PatchStage =
    | "preload" // before any rpgmaker scripts
    | "presetup" // before PluginManager.setup
    | "onload" // window.onload
    | "scriptload"; // PluginManager.loadScript call for suitable scripts

type PatchTargetGame = "omori" | "instarsandtime";

interface PatchScriptData {
    name: string;
    source: string;
}

interface Patch {
    stage: PatchStage;
    target: "common" | PatchTargetGame;
    name: string;
    scripts?: string[];
    patch: (data?: PatchScriptData) => void;
}

interface NativeInfo {
    dataDirectory: string;
    gameDirectory: string;
    key: string;

    webViewPackage: string;
    webViewVersion: string;
    hostVersion: string;
}

interface SavedData {
    achievements: Record<string, boolean>;
}

interface NWCompat {
    // Native
    getNativeInfo: () => string;

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
    game: PatchTargetGame | "unknown";

    nativeInfo: NativeInfo;
    savedData: SavedData;
    loadData: () => void;
    saveData: () => void;

    createAchievementElement: (name: string, description: string, icon: string, id: string) => HTMLDivElement;
}

type PixiJS = typeof import("pixi.js") & {
    tilemap: typeof import("@pixi/tilemap");
    filters: typeof import("pixi-filters");
};

interface Window {
    PIXI: PixiJS;
    nwcompat: NWCompat;
}

declare const PIXI: PixiJS;
declare const nwcompat: NWCompat;
