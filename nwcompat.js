// OneLoader compatibility
var global = globalThis;

console.log(`nwcompat running on ${navigator.userAgent}`);

nwcompat.patches = [];
nwcompat.runPatches = (stage, data) => {
    nwcompat.patches.forEach((patch) => {
        if (patch.stage !== stage) return;
        if (patch.target !== nwcompat.game && patch.target !== "common") return;
        if (stage === "scriptload" && !patch.scripts.includes(data.name.split(".")[0])) return;

        console.log(`Running ${stage} '${patch.name}' patch`);
        try {
            patch.patch(data);
        } catch (e) {
            console.warn(e);
            console.warn(e.stack);
        }
    });
};

nwcompat.dataDirectory = nwcompat.getDataDirectory();
nwcompat.gameDirectory = nwcompat.getGameDirectory();

nwcompat.gamepad = {
    id: "xbox",
    connected: false,
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

    if (module) {
        return module;
    } else {
        const fs = require("fs");
        const pp = require("path");

        try {
            const file = fs.readFileSync(pp.join(process.cwd(), id), "utf8");

            function evalInScope(js, contextAsScope) {
                return function () {
                    with (this) {
                        return eval(js);
                    }
                }.call(contextAsScope);
            }

            const context = { module: { exports: {} } };
            evalInScope(file, context);
            return context.module.exports;
        } catch (e) {
            console.error(`[nwcompat:require] module '${id}' not found`);
        }
    }
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
    browser: true,
};
