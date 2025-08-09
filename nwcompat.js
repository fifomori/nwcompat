// OneLoader compatibility
var global = globalThis;

nwcompat.nativeInfo = JSON.parse(nwcompat.getNativeInfo());

console.log("hello from nwcompat");
console.log(`webview: ${nwcompat.nativeInfo.webViewPackage} ${nwcompat.nativeInfo.webViewVersion}`);
console.log(`host: ${nwcompat.nativeInfo.hostVersion}, useragent: ${navigator.userAgent}`);

nwcompat.game = (() => {
    const data = nwcompat.fsReadFile("index.html");
    if (!data) throw "failed to read index.html";

    const dom = new DOMParser().parseFromString(window.atob(data), "text/html");
    const el = dom.querySelector("title");
    if (!el || !el.innerText) throw "title element not found";

    const text = el.innerText.toLowerCase();
    if (text.includes("omori")) return "omori";
    if (text.includes("in stars and time")) return "instarsandtime";
    return "unknown";
})();

console.log(`detected game: ${nwcompat.game}`);

nwcompat.patches = [];
nwcompat.runPatches = (stage, data) => {
    nwcompat.patches.forEach((patch) => {
        if (patch.stage !== stage) return;
        if (patch.target !== nwcompat.game && patch.target !== "common") return;
        if (stage === "scriptload" && !patch.scripts.includes(data.name.split(".")[0])) return;

        console.log(`Running ${stage} '${patch.target}/${patch.name}' patch`);
        try {
            patch.patch(data);
        } catch (e) {
            console.warn(e);
            console.warn(e.stack);
            debugger;
        }
    });
};

nwcompat.loadData = function () {
    const fs = require("fs");
    const pp = require("path");

    const base = pp.dirname(process.mainModule.filename);
    const savePath = pp.join(base, "save");
    const configPath = pp.join(savePath, "nwcompat.json");

    if (!fs.existsSync(savePath)) fs.mkdirSync(savePath);
    if (!fs.existsSync(configPath)) fs.writeFileSync(configPath, "{}");

    const file = JSON.parse(fs.readFileSync(configPath, "ascii") || "{}");

    // old format, convert to object
    if (Array.isArray(file.achievements)) {
        // TODO migration (but were there any saved achievements if this shit was broken??)
        file.achievements = {};
    }

    nwcompat.savedData = {};
    nwcompat.savedData.achievements = file.achievements || {};
    nwcompat.savedData.gamepad = file.gamepad || {};
    nwcompat.savedData.gamepad.buttons ||= {};
};

nwcompat.saveData = function () {
    const fs = require("fs");
    const pp = require("path");
    const base = pp.dirname(process.mainModule.filename);

    const configPath = pp.join(base, "save", "nwcompat.json");

    fs.writeFile(configPath, JSON.stringify(nwcompat.savedData), () => {
        // TODO alert user if save failed
    });
};

nwcompat.createAchievementElement = function (name, description, icon, id) {
    const elRoot = document.createElement("div");
    elRoot.className = "nwcomapt-achievement";
    elRoot.id = id;

    const elIcon = document.createElement("div");
    elIcon.className = "nwcompat-achievement-icon";
    elIcon.style.backgroundImage = `url(${icon})`;
    elRoot.appendChild(elIcon);

    const elText = document.createElement("div");
    elText.className = "nwcompat-achievement-text";
    elRoot.appendChild(elText);

    const elName = document.createElement("div");
    elName.className = "nwcompat-achievement-name";
    elName.textContent = name;
    elText.appendChild(elName);

    const elDesc = document.createElement("div");
    elDesc.className = "nwcompat-achievement-desc";
    elDesc.textContent = description;
    elText.appendChild(elDesc);

    return elRoot;
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
    cwd: () => nwcompat.nativeInfo.gameDirectory,
    mainModule: {
        filename: nwcompat.nativeInfo.gameDirectory + "/index.html", // too early for path.join
    },
    env: {
        LOCALAPPDATA: nwcompat.nativeInfo.dataDirectory,
    },
    versions: { nw: "0.46.0" },
    platform: "win32",
    browser: true,
};
