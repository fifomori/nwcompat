nwcompat.patches.push({
    stage: "presetup",
    target: "common",
    name: "loader",
    patch: () => {
        const pp = require("path");
        const fs = window.require("fs"); // compatibility with oneloader's overlayfs

        PluginManager.nwcompatReadScript = function (name) {
            return fs.readFileSync(name, "utf8");
        };

        PluginManager.loadScript = function (name) {
            const base = pp.dirname(process.mainModule.filename);
            const url = `${this._path}${name}`;
            const source = PluginManager.nwcompatReadScript(`${base}/${url}`);

            const script = document.createElement("script");
            script.type = "text/javascript";
            script.onerror = this.onError.bind(this);

            script._url = url;
            script.setAttribute("_url", _url);

            const data = { name, source };
            nwcompat.runPatches("omori", "scriptload", data);
            const base64 = Buffer.from(data.source).toString("base64");
            script.src = `data:text/javascript;base64,${base64}`;

            document.body.appendChild(script);
        };
    },
});
