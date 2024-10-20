/// <reference path="../intellisense.d.ts"/>

const fs = {
    readFile(path, callback) {
        if (!callback) return;

        new Promise((resolve, reject) => {
            try {
                resolve(fs.readFileSync(path));
            } catch (e) {
                reject(e);
            }
        })
            .then((data) => callback(null, data))
            .catch((e) => {
                // HACK: GTP_OmoriFixes Permanent_Manager.load throws it and it works in node because it is in another ~~thread~~/idk i forgor
                if (path.includes("CUTSCENE.json")) callback();
                else callback(e);
            });
    },

    readFileSync(path, options = "ascii") {
        // redirect to /data/user/0/com.cafeed28.omori/files/
        if (path.startsWith(nwcompat.dataDirectory)) {
            path = path.replace("/OMORI", "");
        }

        const data = nwcompat.fsReadFile(path);

        if (data == null) {
            throw `ENOENT: no such file or directory, open '${path}'`;
        }

        const buffer = Buffer.from(data, "base64");
        const encoding = typeof options === "string" ? options : options.encoding;
        if (encoding === "utf8" || encoding === "utf-8") return nwcompat.decoder.decode(buffer);
        return buffer;
    },

    writeFile(path, data, callback) {
        fs.writeFileSync(path, data);
        if (callback) {
            new Promise((resolve, reject) => {
                resolve();
            }).then(() => callback());
        }
    },

    writeFileSync(path, data) {
        if (typeof data === "number") data = String(data);
        if (typeof data === "string") data = nwcompat.encoder.encode(data);

        nwcompat.fsWriteFile(path, data);
    },

    readdir(path, callback) {
        if (!callback) return;

        new Promise((resolve, reject) => {
            resolve(fs.readdirSync(path));
        }).then((data) => callback(null, data));
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

        new Promise((resolve, reject) => {
            resolve(fs.statSync(path));
        }).then((data) => callback(null, data));
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
        return fs.statSync(path).isExists();
    },

    rename(oldPath, newPath, callback) {
        if (callback)
            new Promise((resolve, reject) => {
                resolve(fs.renameSync(oldPath, newPath));
            }).then((data) => callback(null, data));
    },

    renameSync(oldPath, newPath) {
        nwcompat.fsRename(oldPath, newPath);
    },

    // Stubs
    openSync() {},
    writeSync() {},
};

module.exports = fs;
