nwcompat.patches.push({
    stage: "onload",
    target: "omori",
    name: "performance",
    patch: () => {
        const path = require("path");
        const fs = require("fs");

        const oSceneManager = { initGraphics: SceneManager.initGraphics };
        SceneManager.initGraphics = function () {
            oSceneManager.initGraphics.call(this, ...arguments);
            this._renderTexture = PIXI.RenderTexture.create({
                width: Graphics.width,
                height: Graphics.height,
            });
            this._backgroundSprite = new PIXI.Sprite(this._renderTexture);
        };

        SceneManager.snapForBackground = function () {
            Graphics._renderer.render(this._scene, {
                renderTexture: this._renderTexture,
            });
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
        DataManager._cacheTiledMap = [];
        DataManager._cacheTileset = [];

        const oDataManager = {
            loadMapData: DataManager.loadMapData,
            loadTiledMapData: DataManager.loadTiledMapData,
            loadTilesetData: DataManager.loadTilesetData,
        };

        // GTP_OmoriFixes
        DataManager.loadMapData = function (mapId) {
            if (!!Utils.isOptionValid("test")) {
                return oDataManager.loadMapData.call(this, ...arguments);
            }

            if (mapId > 0) {
                if (this._cacheMap[mapId]) {
                    $dataMap = this._cacheMap[mapId];

                    DataManager.onLoad($dataMap);
                    Graphics.endLoading();
                    this._mapLoader = true;
                } else {
                    this._mapLoader = false;
                    $dataMap = null;
                    Graphics.startLoading();

                    const base = path.dirname(process.mainModule.filename);
                    const filename = `${base}/data/Map${mapId.padZero(3)}.KEL`;
                    try {
                        const buffer = fs.readFileSync(filename);
                        const data = Encryption.decrypt(buffer).toString();
                        $dataMap = this._cacheMap[mapId] = JSON.parse(data);

                        DataManager.onLoad($dataMap);
                        Graphics.endLoading();
                        this._mapLoader = true;
                    } catch (e) {
                        Graphics.printLoadingError(filename);
                        SceneManager.stop();
                    }
                }

                this.loadTiledMapData(mapId);
            } else {
                this.makeEmptyMap();
                this.unloadTiledMapData();
            }
        };

        // YED_Tiled
        DataManager.loadTiledMapData = function (mapId) {
            if (!!Utils.isOptionValid("test")) {
                return oDataManager.loadTiledMapData.call(this, ...arguments);
            }

            if (this._cacheTiledMap[mapId]) {
                DataManager._tempTiledData = this._cacheTiledMap[mapId];
                DataManager.loadTilesetData();
                DataManager._tiledLoaded = true;
            } else {
                const base = path.dirname(process.mainModule.filename);
                const filename = `${base}/maps/map${mapId}.AUBREY`;
                this.unloadTiledMapData();
                try {
                    const buffer = fs.readFileSync(filename);
                    const decrypt = Encryption.decrypt(buffer);
                    DataManager._tempTiledData = this._cacheTiledMap[mapId] = JSON.parse(decrypt.toString());
                    DataManager.loadTilesetData();
                    DataManager._tiledLoaded = true;
                } catch (e) {
                    console.error(e);
                    Graphics.printLoadingError(filename);
                    SceneManager.stop();
                }
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
                        var base = path.dirname(process.mainModule.filename);
                        try {
                            const buffer = fs.readFileSync(base + "/maps/" + filename.replace(".json", ".AUBREY"));
                            const data = JSON.parse(Encryption.decrypt(buffer).toString());
                            this._cacheTileset[filename] = data;
                            Object.assign(tileset, data);
                            DataManager._tilesetToLoad--;
                        } catch (e) {
                            throw e;
                        }
                    }
                }
            }
        };
    },
});
