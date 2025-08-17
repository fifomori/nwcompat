nwcompat.patches.push({
    stage: "onload",
    target: "omori",
    name: "performance",
    patch: () => {
        const pp = require("path");
        const fs = window.require("fs");

        const oSceneManager = { initGraphics: SceneManager.initGraphics };
        SceneManager.initGraphics = function () {
            oSceneManager.initGraphics.call(this, ...arguments);

            this._renderTexture = PIXI.RenderTexture.create({
                width: Graphics.width,
                height: Graphics.height,
            });
            this._backgroundSprite = new PIXI.Sprite(this._renderTexture);

            // GTP_OmoriFixes
            // create a ticker without maxFPS
            this.ticker = new PIXI.Ticker();
            this.ticker.add(this.update, this);
            this.ticker.start();

            const win = window.nw.Window.get();

            win.on("minimize", () => {
                this._minimizeHandler = setInterval(() => {
                    if (WebAudio._masterVolume <= 0) {
                        clearInterval(this._minimizeHandler);
                    }
                    this.updateWebAudio();
                    this.updateVideos();
                }, 25);
            });

            win.on("restore", () => {
                this._clearMinimizeHandler();
            });
        };

        SceneManager.snapForBackground = function () {
            Graphics._renderer.render(this._scene, {
                renderTexture: this._renderTexture,
            });
        };

        // GTP_OmoriFixes
        SceneManager.update = function () {
            Graphics.tickStart();
            try {
                this.updateManagers();
                this.updateMain();
            } catch (e) {
                this.catchException(e);
            }
            this.renderScene();
            Graphics.tickEnd();
        };

        Scene_Menu.prototype.createBackground =
            Scene_OmoMenuBase.prototype.createBackground =
            Scene_OmoBlackLetterMenu.prototype.createBackground =
            Scene_OmoriQuest.prototype.createBackground =
            Scene_OmoriItemShop.prototype.createBackground =
            Sprite_MapCharacterTag.prototype.createBackground =
                Scene_MenuBase.prototype.createBackground;

        Sprite_MapCharacterTag.prototype.show = function () {
            this._index = 0;
            this.refreshPartySprites();
            this.resetPartySprites();
            SceneManager.snapForBackground();
            this._partySpritesContainer.opacity = 0;
            this.startStartupAnim();
            this._released = false;
            this._finished = false;
        };

        DataManager._cacheMap = Yanfly.PreloadedMaps;
        DataManager._cacheData = {};
        DataManager._cacheTiledMap = [];
        DataManager._cacheTileset = [];

        const oDataManager = {
            loadMapData: DataManager.loadMapData,
            loadDataFile: DataManager.loadDataFile,
            loadTiledMapData: DataManager.loadTiledMapData,
            loadTilesetData: DataManager.loadTilesetData,
        };

        // GTP_OmoriFixes
        DataManager.loadMapData = function (mapId) {
            if (!!Utils.isOptionValid("test")) {
                return oDataManager.loadMapData.call(this, ...arguments);
            }

            if (mapId > 0) {
                this._mapLoader = false;
                window["$dataMap"] = null;
                Graphics.startLoading();

                if (this._cacheMap[mapId]) {
                    new Promise((resolve) => resolve()).then(() => {
                        window["$dataMap"] = this._cacheMap[mapId];

                        DataManager.onLoad(window["$dataMap"]);
                        Graphics.endLoading();
                        this._mapLoader = true;
                    });
                } else {
                    const base = pp.dirname(process.mainModule.filename);
                    const filename = `${base}/data/Map${mapId.padZero(3)}.KEL`;
                    fs.readFile(filename, (err, buffer) => {
                        if (!!err) {
                            Graphics.printLoadingError(filename);
                            SceneManager.stop();
                        }
                        const data = Encryption.decrypt(buffer).toString();
                        window["$dataMap"] = this._cacheMap[mapId] = JSON.parse(data);

                        DataManager.onLoad(window["$dataMap"]);
                        Graphics.endLoading();
                        this._mapLoader = true;
                    });
                }

                this.loadTiledMapData(mapId);
            } else {
                this.makeEmptyMap();
                this.unloadTiledMapData();
            }
        };

        // GTP_OmoriFixes
        DataManager.loadDataFile = function (name, src) {
            if (!!Utils.isOptionValid("test")) {
                return oDataManager.loadMapData.call(this, ...arguments);
            }

            if (this._cacheData[name]) {
                new Promise((resolve) => resolve()).then(() => {
                    window[name] = this._cacheData[name];
                    DataManager.onLoad(window[name]);
                });
            } else {
                const base = pp.dirname(process.mainModule.filename);
                const filename = `${base}/data/${src}`;
                fs.readFile(filename, (err, buffer) => {
                    if (!!err) throw new Error(err);
                    const data = Encryption.decrypt(buffer).toString();
                    window[name] = this._cacheData[name] = JSON.parse(data);
                    DataManager.onLoad(window[name]);
                });
            }
        };

        // YED_Tiled
        DataManager.loadTiledMapData = function (mapId) {
            if (!!Utils.isOptionValid("test")) {
                return oDataManager.loadTiledMapData.call(this, ...arguments);
            }

            this.unloadTiledMapData();

            if (this._cacheTiledMap[mapId]) {
                new Promise((resolve) => resolve()).then(() => {
                    DataManager._tempTiledData = this._cacheTiledMap[mapId];
                    DataManager.loadTilesetData();
                    DataManager._tiledLoaded = true;
                });
            } else {
                const base = pp.dirname(process.mainModule.filename);
                const filename = `${base}/maps/map${mapId}.AUBREY`;
                fs.readFile(filename, (err, buffer) => {
                    if (!!err) {
                        console.error(err);
                        Graphics.printLoadingError(filename);
                        SceneManager.stop();
                    }
                    const decrypt = Encryption.decrypt(buffer);
                    DataManager._tempTiledData = this._cacheTiledMap[mapId] = JSON.parse(decrypt.toString());
                    DataManager.loadTilesetData();
                    DataManager._tiledLoaded = true;
                });
            }
        };

        // YED_Tiled
        DataManager.loadTilesetData = function () {
            for (const tileset of DataManager._tempTiledData.tilesets) {
                if (!tileset.source) continue;

                const filename = tileset.source.replace(/^.*[\\\/]/, "");

                if (this._cacheTileset[filename]) {
                    Object.assign(tileset, this._cacheTileset[filename]);
                } else {
                    DataManager._tilesetToLoad++;
                    if (Utils.isOptionValid("test")) {
                        const xhr = new XMLHttpRequest();

                        xhr.open("GET", "./maps/" + filename);
                        xhr.overrideMimeType("application/json");

                        xhr.onreadystatechange = function () {
                            if (xhr.readyState === 4) {
                                if (xhr.status === 200 || xhr.responseText !== "") {
                                    const data = JSON.parse(xhr.responseText);
                                    this._cacheTileset[filename] = data;
                                    Object.assign(tileset, data);
                                }
                                DataManager._tilesetToLoad--;
                            }
                        };

                        xhr.send();
                    } else {
                        var base = pp.dirname(process.mainModule.filename);
                        fs.readFile(base + "/maps/" + filename.replace(".json", ".AUBREY"), (err, buffer) => {
                            if (!!err) {
                                throw new Error(err);
                            }

                            const data = JSON.parse(Encryption.decrypt(buffer).toString());
                            this._cacheTileset[filename] = data;
                            Object.assign(tileset, data);
                            DataManager._tilesetToLoad--;
                        });
                    }
                }
            }
        };
    },
});
