/// <reference path="intellisense.d.ts"/>

// OneLoader compatibility
var global = globalThis;

nwcompat.decoder = new TextDecoder();
nwcompat.encoder = new TextEncoder();

nwcompat.dataDirectory = nwcompat.getDataDirectory();
nwcompat.gameDirectory = nwcompat.getGameDirectory();

nwcompat.patches = [];
nwcompat.runPatches = (stage, data) => {
    nwcompat.patches.forEach((patch) => {
        if (patch.stage === stage) {
            console.log(`Running ${stage} stage patch`);
            patch.patch(data);
        }
    });
};

globalThis.require = (id) => {
    let module = __requireCache[id];

    // hacky
    if (id.startsWith("./modloader")) {
        const fs = require("fs");
        const pp = require("path");
        // OneLoader
        const file = fs.readFileSync(pp.join(process.cwd(), id));

        function evalInScope(js, contextAsScope) {
            return function () {
                with (this) {
                    return eval(js);
                }
            }.call(contextAsScope);
        }

        const context = { module: { exports: {} } };
        evalInScope(nwcompat.decoder.decode(file), context);
        return context.module.exports;
    }

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
    versions: { nw: "0.46.0" },
    platform: "win32",
};
