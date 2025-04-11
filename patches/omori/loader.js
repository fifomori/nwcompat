nwcompat.patches.push({
    stage: "presetup",
    target: "omori",
    name: "loader",
    patch: () => {
        const pp = require("path");
        const fs = window.require("fs");
        const crypto = require("crypto");

        const algorithm = "aes-256-ctr";
        let steamkey = String(window.nw.App.argv).replace("--", "");

        const applySteamLibrary = (plugins) => {
            const i = plugins.slice(0, 16);
            plugins = plugins.slice(16);
            const d = crypto.createDecipheriv(algorithm, steamkey, i);
            const r = Buffer.concat([d.update(plugins), d.final()]);
            return r;
        };

        PluginManager.nwcompatReadScript = function (name) {
            const buffer = fs.readFileSync(name);

            if (name.contains("vorbis")) {
                return buffer.toString();
            } else {
                return applySteamLibrary(buffer).toString();
            }
        };

        PluginManager.loadScript = function (name) {
            if (!name.contains("vorbis")) {
                name = name.replace(/.js/i, ".OMORI");
            }

            const base = pp.dirname(process.mainModule.filename);
            const url = `${this._path}${name}`;
            const source = PluginManager.nwcompatReadScript(`${base}/${url}`);

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.onerror = this.onError.bind(this);
            script._url = url;

            const data = { name, source };
            nwcompat.runPatches("scriptload", data);
            script.innerHTML = data.source;

            document.body.appendChild(script);
        };
    },
});
