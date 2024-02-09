/// <reference path="intellisense.d.ts"/>

// OneLoader compatibility
var global = globalThis;

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

nwcompat.async = {};
nwcompat.async.awaiters = new Map();

nwcompat.async.call = async (methodName, args) => {
    const s = performance.now();
    const id = Math.floor(Math.random() * 1000000);
    if (nwcompat.async.awaiters.has(id)) {
        throw "Kafif!!!! while !has: id = gen()";
    }

    /**
     * @type {Awaiter}
     */
    const awaiter = {};

    const promise = new Promise((resolve, reject) => {
        awaiter.resolve = (r) => resolve(r);
        awaiter.reject = (r) => reject(r);
    });

    nwcompat.async.awaiters.set(id, awaiter);
    const e = performance.now();
    // console.log(`async.call: prepared in ${e - s}ms`);

    const ss = performance.now();
    nwcompat.asyncCall(id, methodName, JSON.stringify(args));
    const ee = performance.now();
    // console.log(`async.call: called in ${ee - ss}ms`);

    return promise;
};

nwcompat.async.callback = (id, success, result) => {
    const awaiter = nwcompat.async.awaiters.get(id);
    success ? awaiter.resolve(result) : awaiter.reject(result);
    nwcompat.async.awaiters.delete(id);
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
