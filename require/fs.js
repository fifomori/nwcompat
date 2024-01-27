/// <reference path="../intellisense.d.ts"/>

/**
 * @type {import('node:fs')}
 */
const fs = {
    readFile(path, callback) {
        if (!callback) return;

        let data;
        try {
            data = this.readFileSync(path);
        } catch (err) {
            // HACK: GTP_OmoriFixes Permanent_Manager.load throws it and it works in node because it is in another thread
            if (path.includes("CUTSCENE.json")) callback();
            else callback(err);
            return;
        }

        callback(null, data);
    },

    /**
     * @param {string} path
     * @param {{ encoding: string } | string | undefined} options
     */
    readFileSync(path, options = "ascii") {
        // redirect to /data/user/0/com.cafeed28.omori/files/
        if (path.startsWith(nwcompat.dataDirectory)) {
            path = path.replace("/OMORI", "");
        }

        let logStr = `readFileSync('${path}'): `;

        const rs = performance.now();
        const data = nwcompat.fsReadFile(path);
        const re = performance.now();
        logStr += `read: ${re - rs}ms`;

        if (!data) {
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

    /**
     * @param {string} path
     * @param {(err?: Error, data?: string[]) => any} callback
     */
    stat(path, callback) {
        if (!callback) return;

        callback(null, this.statSync(path));
    },

    /**
     * @param {string} path
     */
    statSync(path) {
        const stat = nwcompat.fsStat(path);
        return {
            isFile: () => stat == 1,
            isDirectory: () => stat == 2,
            isExists: () => stat != -1,
        };
    },

    /**
     * @param {string} path
     */
    existsSync(path) {
        return this.statSync(path).isExists();
    },

    /**
     * @param {string} path
     */
    readdirSync(path) {
        return nwcompat.fsReadDir(path).split(":");
    },

    /**
     * @param {string} path
     */
    mkdirSync(path) {
        nwcompat.fsMkDir(path);
    },

    writeFile(path, data, callback) {
        this.writeFileSync(path, data);
        if (callback) callback();
    },

    writeFileSync(path, data) {
        console.log(`writeFileSync('${path}'): typeof data: ${typeof data}`);

        if (typeof data === "number") data = String(data);
        if (typeof data === "string") data = nwcompat.encoder.encode(data);

        nwcompat.fsWriteFile(path, data);
    },

    unlinkSync(path) {
        nwcompat.fsUnlink(path);
    },

    rename(oldPath, newPath, callback) {
        if (!callback) return;

        callback(null, this.renameSync(oldPath, newPath));
    },

    renameSync(oldPath, newPath) {
        nwcompat.fsRename(oldPath, newPath);
    },
};

module.exports = fs;
