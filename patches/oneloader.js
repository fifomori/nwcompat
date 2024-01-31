nwcompat.patches.push({
    preload: false,
    patch: () => {
        if (typeof $modLoader === "undefined") return;

        // Copied from OneLoader
        function _vfs_resolve_file_path(relativePath) {
            relativePath = relativePath.toLowerCase();
            let dirTree = _overlay_fs_split_path(relativePath);
            let currentDir = $modLoader.overlayFS;
            let fileName = dirTree.pop();

            if (/\%[0-9A-Fa-f]{2,}/.test(fileName)) {
                try {
                    window._logLine("Trying to decode URI component");
                    fileName = decodeURIComponent(fileName);
                    window._logLine("Decoded URI component for " + fileName);
                } catch (e) {}
            }

            let bail = false;
            let entry;
            while (dirTree.length > 0) {
                let nextDepth = dirTree.shift();
                if (currentDir[nextDepth] && currentDir[nextDepth].children) {
                    currentDir = currentDir[nextDepth].children;
                } else {
                    bail = true;
                    break;
                }
            }

            if (!bail) {
                if (currentDir[fileName] && currentDir[fileName].type !== "dir") {
                    entry = currentDir[fileName];
                } else {
                    bail = true;
                }
            }

            return entry;
        }

        const oXMLHttpRequest = {
            open: XMLHttpRequest.prototype.open,
            send: XMLHttpRequest.prototype.send,
        };

        XMLHttpRequest.prototype.open = function (method, url, async) {
            this._nwcompat_url = url;
            return oXMLHttpRequest.open.call(this, ...arguments);
        };

        XMLHttpRequest.prototype.send = function () {
            let entry = _vfs_resolve_file_path(this._nwcompat_url);
            if (entry) {
                this._nwcompat_responseHook = true;
                setTimeout(() => {
                    if (this.onload) this.onload();
                    // this.dispatchEvent(new Event("load"));
                }, 1);
                return;
            }

            return oXMLHttpRequest.send.call(this, ...arguments);
        };

        XMLHttpRequest = class extends XMLHttpRequest {
            get response() {
                if (!this._nwcompat_responseHook) return super.response;

                try {
                    let data = _vfs_resolve_file_sync(this._nwcompat_url);
                    if (this.responseType === "arraybuffer") {
                        return data.buffer;
                    } else {
                        return data;
                    }
                } catch (e) {
                    console.error(e);
                    return super.response;
                }
            }
        };
    },
});
