/// <reference path="../intellisense.d.ts"/>

const fs = {
    readFile(path, callback) {
        if (!callback) return;

        try {
            callback(null, __requireCache["fs"].readFileSync(path, "async"));
        } catch (err) {
            // HACK: GTP_OmoriFixes Permanent_Manager.load throws it and it works in node because it is in another thread
            if (path.includes("CUTSCENE.json")) callback();
            else callback(err);
        }
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
        __requireCache["fs"].writeFileSync(path, data);
        if (callback) callback();
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
        callback(null, fs.readdirSync(path));
    },

    readdirSync(path) {
        return nwcompat.fsReadDir(path).split(":");
    },

    mkdirSync(path) {
        nwcompat.fsMkDir(path);
    },

    unlinkSync(path) {
        nwcompat.fsUnlink(path);
    },

    stat(path, callback) {
        if (!callback) return;
        callback(null, __requireCache["fs"].statSync(path));
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
        return __requireCache["fs"].statSync(path).isExists();
    },

    rename(oldPath, newPath, callback) {
        if (!callback) return;
        callback(null, __requireCache["fs"].renameSync(oldPath, newPath));
    },

    renameSync(oldPath, newPath) {
        nwcompat.fsRename(oldPath, newPath);
    },

    // Stubs
    openSync() {},
    writeSync() {},
};

module.exports = fs;
