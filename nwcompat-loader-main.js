/// <reference path="intellisense.d.ts"/>

// rpg_managers.js
(function () {
    const crypto = require("crypto");
    const path = require("path");
    const fs = require("fs");

    const algorithm = "aes-256-ctr";
    let steamkey = String(window.nw.App.argv).replace("--", "");

    const applySteamLibrary = (plugins) => {
        const i = plugins.slice(0, 16);
        plugins = plugins.slice(16);
        const d = crypto.createDecipheriv(algorithm, steamkey, i);
        const r = Buffer.concat([d.update(plugins), d.final()]);
        return r;
    };

    const oPluginManager = {
        loadScript: PluginManager.loadScript,
    };

    PluginManager.loadScript = function (name) {
        if (name.contains("vorbis")) {
            return oPluginManager.loadScript.call(this, ...arguments);
        }

        name = name.replace(".js", ".OMORI").replace(".JS", ".OMORI");
        const base = path.dirname(process.mainModule.filename);

        const url = `${this._path}${name}`;
        const buffer = fs.readFileSync(`${base}/${url}`);

        const script = document.createElement("script");
        script.type = "text/javascript";
        script._url = url;

        const data = {
            name: name.replace(".OMORI", ""),
            source: applySteamLibrary(buffer).toString(),
        };
        nwcompat.runPatches("scriptload", data);
        script.innerHTML = data.source;

        document.body.appendChild(script);
    };
})();

// main.js
PluginManager.setup($plugins);
window.onload = function () {
    nwcompat.runPatches("onload");
    SceneManager.run(Scene_Boot);
};
