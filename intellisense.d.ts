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

interface ButtonSavedData {
    inset: {
        x: number;
        y: number;
    };
}

interface SavedData {
    achievements: Record<string, boolean>;
    gamepad: {
        buttonSize: number;
        buttons: Record<string, ButtonSavedData>;
    };
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

import pixi from "pixi.js";

type PixiJS = typeof pixi & {
    tilemap: typeof import("@pixi/tilemap");
    filters: typeof import("pixi-filters");
};

interface ResourceSprite<R extends pixi.Resource> extends pixi.Sprite {
    texture: pixi.Texture<R>;
}

interface NWWindow extends Window {
    PIXI: PixiJS;
    nwcompat: NWCompat;
}

declare var window: NWWindow & typeof globalThis;

declare global {
    const PIXI: PixiJS;
    const nwcompat: NWCompat;
}
