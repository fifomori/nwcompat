/// <reference path="intellisense.d.ts"/>

// OneLoader compatibility
var global = globalThis;

console.log(`nwcompat running on ${navigator.userAgent}`);

nwcompat.patches = [];
nwcompat.runPatches = (stage, data) => {
    nwcompat.patches.forEach((patch) => {
        if (patch.stage !== stage) return;
        if (stage === "scriptload" && !patch.scripts.includes(data.name)) return;

        console.log(`Running ${stage} '${patch.name}' patch`);
        patch.patch(data);
    });
};

nwcompat.decoder = new TextDecoder();
nwcompat.encoder = new TextEncoder();

nwcompat.dataDirectory = nwcompat.getDataDirectory();
nwcompat.gameDirectory = nwcompat.getGameDirectory();

nwcompat.gamepad = {
    id: "xbox",
    connected: true,
    axes: [0, 0],
    buttons: [
        { pressed: false }, // 0: A
        { pressed: false }, // 1: B
        { pressed: false }, // 2: X
        { pressed: false }, // 3: Y
        { pressed: false }, // 4: LB
        { pressed: false }, // 5: RB
        { pressed: false }, // 6: unused
        { pressed: false }, // 7: unused
        { pressed: false }, // 8: unused
        { pressed: false }, // 9: unused
        { pressed: false }, // 10: unused
        { pressed: false }, // 11: unused
        { pressed: false }, // 12: D-pad up
        { pressed: false }, // 13: D-pad down
        { pressed: false }, // 14: D-pad left
        { pressed: false }, // 15: D-pad right
    ],
};

navigator.getGamepads = () => {
    return [nwcompat.gamepad];
};

nwcompat.achievements = [];
nwcompat.createAchievementElement = function (name, description, icon, id) {
    const el = document.createElement("div");
    el.className = "chromori_achievement";
    el.id = id;
    el.innerHTML = `<div class="chromori_achievement_icon" style="background-image: url(${icon})"></div>
                    <div class="chromori_achievement_text">
                        <div class="chromori_achievement_name">${name}</div>
                        <div class="chromori_achievement_desc">${description}</div>
                    </div>`;
    return el;
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
