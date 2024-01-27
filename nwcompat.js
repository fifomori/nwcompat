/// <reference path="intellisense.d.ts"/>

nwcompat.decoder = new TextDecoder();
nwcompat.encoder = new TextEncoder();

nwcompat.dataDirectory = nwcompat.getDataDirectory();
nwcompat.gameDirectory = nwcompat.getGameDirectory();

nwcompat.patches = [];
nwcompat.runPatches = (preload) => {
    nwcompat.patches.forEach((patch) => {
        if (preload && !patch.preload) return;
        if (!preload && patch.preload) return;

        console.log(`Running ${preload ? "pre" : "post"}load patch`);

        patch.patch();
    });
};

window.addEventListener("load", () => {
    nwcompat.runPatches(false);
});

globalThis.require = (id) => {
    let module = __requireCache[id];
    if (!module) {
        console.error(`[nwcompat:require] module '${id}' not found`);
        debugger;
    }
    return module;
};

globalThis.process = {
    cwd: () => nwcompat.gameDirectory,
    mainModule: {
        filename: nwcompat.gameDirectory + "/index.html", // too early for path.join
    },
    env: {
        LOCALAPPDATA: nwcompat.dataDirectory,
    },
    versions: { nw: "0.29.0" },
    platform: "win32",
};
