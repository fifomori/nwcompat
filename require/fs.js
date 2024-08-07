/// <reference path="../intellisense.d.ts"/>

const fs = {
    readFile(path, callback) {
        if (!callback) return;

        setTimeout(() => {
            try {
                callback(null, require("fs").readFileSync(path, "async"));
            } catch (err) {
                // HACK: GTP_OmoriFixes Permanent_Manager.load throws it and it works in node because it is in another ~~thread~~/idk i forgor
                if (path.includes("CUTSCENE.json")) callback();
                else callback(err);
            }
        }, 1);
    },

    readFileSync(path, options = "ascii") {
        // redirect to /data/user/0/com.cafeed28.omori/files/
        if (path.startsWith(nwcompat.dataDirectory)) {
            path = path.replace("/OMORI", "");
        }

        let logStr = options == "async" ? "readFile" : "readFileSync";

        logStr += `('${path}'): `;

        const rs = performance.now();
        const data = nwcompat.fsReadFile(path);
        const re = performance.now();
        logStr += `read: ${re - rs}ms`;

        if (data == null) {
            logStr += ` ENOENT`;
            console.debug(logStr);
            throw "ENOENT";
        }

        const ds = performance.now();
        const buffer = Buffer.from(data, "base64");
        const de = performance.now();

        logStr += `, decode: ${de - ds}ms`;

        console.debug(logStr);

        let encoding = typeof options === "string" ? options : options.encoding;
        if (encoding === "utf8" || encoding === "utf-8") return nwcompat.decoder.decode(buffer);
        return buffer;
    },

    writeFile(path, data, callback) {
        require("fs").writeFileSync(path, data);
        if (callback) {
            setTimeout(() => {
                callback();
            }, 1);
        }
    },

    writeFileSync(path, data) {
        let logStr = `writeFileSync('${path}'): typeof data: ${typeof data}`;

        const es = performance.now();
        if (typeof data === "number") data = String(data);
        if (typeof data === "string") data = nwcompat.encoder.encode(data);
        const ee = performance.now();

        const ws = performance.now();
        nwcompat.fsWriteFile(path, data);
        const we = performance.now();

        logStr += `, encode: ${ee - es}ms, write: ${we - ws}ms`;

        console.debug(logStr);
    },

    readdir(path, callback) {
        if (!callback) return;

        setTimeout(() => {
            callback(null, fs.readdirSync(path));
        }, 1);
    },

    readdirSync(path) {
        return nwcompat.fsReadDir(path).split(":").sort();
    },

    mkdirSync(path) {
        nwcompat.fsMkDir(path);
    },

    unlinkSync(path) {
        nwcompat.fsUnlink(path);
    },

    stat(path, callback) {
        if (!callback) return;

        setTimeout(() => {
            callback(null, require("fs").statSync(path));
        }, 1);
    },

    statSync(path) {
        const stat = nwcompat.fsStat(path);
        return {
            isFile: () => stat == 1,
            isDirectory: () => stat == 2,
            isExists: () => stat != -1,
        };
    },

    existsSync(path) {
        return require("fs").statSync(path).isExists();
    },

    rename(oldPath, newPath, callback) {
        if (!callback) return;

        setTimeout(() => {
            callback(null, require("fs").renameSync(oldPath, newPath));
        }, 1);
    },

    renameSync(oldPath, newPath) {
        nwcompat.fsRename(oldPath, newPath);
    },

    // Stubs
    openSync() {},
    writeSync() {},
};

module.exports = fs;
