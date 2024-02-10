nwcompat.patches.push({
    preload: false,
    patch: () => {
        const path = __requireCache["path"];
        const fs = __requireCache["fs"];

        const oSceneManager = { initGraphics: SceneManager.initGraphics };
        SceneManager.initGraphics = function () {
            oSceneManager.initGraphics.call(this, ...arguments);
            this._renderTexture = PIXI.RenderTexture.create(Graphics.width, Graphics.height);
            this._backgroundSprite = new PIXI.Sprite(this._renderTexture);
        };

        SceneManager.snapForBackground = function () {
            Graphics._renderer.render(this._scene, this._renderTexture);
        };

        const common_createBackgroundBlurred = function () {
            console.debug("common_createBackgroundBlurred", this);

            const blur = new PIXI.filters.BlurFilter();
            blur.blur = 1;
            blur.padding = 0;

            this._backgroundSprite = SceneManager._backgroundSprite;
            this._backgroundSprite.filters = [blur];
        };

        Scene_Menu.prototype.createBackground =
            Scene_OmoriQuest.prototype.createBackground =
            Scene_OmoMenuBase.prototype.createBackground =
            Sprite_MapCharacterTag.prototype.createBackground =
            Scene_OmoBlackLetterMenu.prototype.createBackground =
                function () {
                    common_createBackgroundBlurred.call(this);
                    this.addChild(this._backgroundSprite);
                };

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

        // dirty
        const oHTMLCanvasElement = { getContext: HTMLCanvasElement.prototype.getContext };
        HTMLCanvasElement.prototype.getContext = function () {
            if (arguments[0] == "2d") {
                return oHTMLCanvasElement.getContext.call(this, "2d", { willReadFrequently: true });
            } else {
                return oHTMLCanvasElement.getContext.call(this, ...arguments);
            }
        };

        DataManager._cacheMap = Yanfly.PreloadedMaps;
        DataManager._cacheTiledMap = [];
        DataManager._cacheTileset = [];

        const oDataManager = {
            loadGlobalInfo: DataManager.loadGlobalInfo,
            saveGlobalInfo: DataManager.saveGlobalInfo,
            loadMapData: DataManager.loadMapData,
            loadTiledMapData: DataManager.loadTiledMapData,
            loadTilesetData: DataManager.loadTilesetData,
        };

        DataManager.loadGlobalInfo = function () {
            if (!this._globalInfo) {
                this._globalInfo = oDataManager.loadGlobalInfo.call(this, ...arguments);
            }
            return this._globalInfo;
        };

        DataManager.saveGlobalInfo = function () {
            this._globalInfo = null;
            oDataManager.saveGlobalInfo.call(this, ...arguments);
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

        // Backported from MZ
        Window.prototype._createAllParts = function () {
            // Copied from MV
            this._windowSpriteContainer = new PIXI.Container();
            this._windowContentsSprite = new Sprite();
            this._downArrowSprite = new Sprite();
            this._upArrowSprite = new Sprite();
            this._windowPauseSignSprite = new Sprite();
            this.addChild(this._windowSpriteContainer);
            this.addChild(this._windowContentsSprite);
            this.addChild(this._downArrowSprite);
            this.addChild(this._upArrowSprite);
            this.addChild(this._windowPauseSignSprite);

            // _createBackSprite
            this._windowBackSprite = new Sprite();
            this._windowBackSprite.addChild(new TilingSprite());
            this._windowSpriteContainer.addChild(this._windowBackSprite);

            // _createFrameSprite
            this._windowFrameSprite = new Sprite();
            for (let i = 0; i < 8; i++) {
                this._windowFrameSprite.addChild(new Sprite());
            }
            this._windowSpriteContainer.addChild(this._windowFrameSprite);

            // _createCursorSprite
            this._windowCursorSprite = new Sprite();
            for (let i = 0; i < 9; i++) {
                this._windowCursorSprite.addChild(new Sprite());
            }
            this.addChild(this._windowCursorSprite);
        };

        Window.prototype._setRectPartsGeometry = function (sprite, srect, drect, m) {
            const sx = srect.x;
            const sy = srect.y;
            const sw = srect.width;
            const sh = srect.height;
            const dx = drect.x;
            const dy = drect.y;
            const dw = drect.width;
            const dh = drect.height;
            const smw = sw - m * 2;
            const smh = sh - m * 2;
            const dmw = dw - m * 2;
            const dmh = dh - m * 2;
            const children = sprite.children;
            sprite.setFrame(0, 0, dw, dh);
            sprite.move(dx, dy);
            // corner
            children[0].setFrame(sx, sy, m, m);
            children[1].setFrame(sx + sw - m, sy, m, m);
            children[2].setFrame(sx, sy + sw - m, m, m);
            children[3].setFrame(sx + sw - m, sy + sw - m, m, m);
            children[0].move(0, 0);
            children[1].move(dw - m, 0);
            children[2].move(0, dh - m);
            children[3].move(dw - m, dh - m);
            // edge
            children[4].move(m, 0);
            children[5].move(m, dh - m);
            children[6].move(0, m);
            children[7].move(dw - m, m);
            children[4].setFrame(sx + m, sy, smw, m);
            children[5].setFrame(sx + m, sy + sw - m, smw, m);
            children[6].setFrame(sx, sy + m, m, smh);
            children[7].setFrame(sx + sw - m, sy + m, m, smh);
            children[4].scale.x = dmw / smw;
            children[5].scale.x = dmw / smw;
            children[6].scale.y = dmh / smh;
            children[7].scale.y = dmh / smh;
            // center
            if (children[8]) {
                children[8].setFrame(sx + m, sy + m, smw, smh);
                children[8].move(m, m);
                children[8].scale.x = dmw / smw;
                children[8].scale.y = dmh / smh;
            }
            for (const child of children) {
                child.visible = dw > 0 && dh > 0;
            }
        };

        Window.prototype._refreshBack = function () {
            const m = this._margin;
            const w = Math.max(0, this._width - m * 2);
            const h = Math.max(0, this._height - m * 2);
            const sprite = this._windowBackSprite;
            const tilingSprite = sprite.children[0];
            // [Note] We use 95 instead of 96 here to avoid blurring edges.
            sprite.bitmap = this._windowskin;
            sprite.setFrame(0, 0, 95, 95);
            sprite.move(m, m);
            sprite.scale.x = w / 95;
            sprite.scale.y = h / 95;
            tilingSprite.bitmap = this._windowskin;
            tilingSprite.setFrame(0, 96, 96, 96);
            tilingSprite.move(0, 0, w, h);
            tilingSprite.scale.x = 1 / sprite.scale.x;
            tilingSprite.scale.y = 1 / sprite.scale.y;
            sprite.setColorTone(this._colorTone);
        };

        Window.prototype._refreshFrame = function () {
            const drect = { x: 0, y: 0, width: this._width, height: this._height };
            const srect = { x: 96, y: 0, width: 96, height: 96 };
            const m = 24;
            for (const child of this._windowFrameSprite.children) {
                child.bitmap = this._windowskin;
            }
            this._setRectPartsGeometry(this._windowFrameSprite, srect, drect, m);
        };

        Window.prototype._refreshCursor = function () {
            const drect = this._cursorRect.clone();
            const srect = { x: 96, y: 96, width: 48, height: 48 };
            const m = 4;
            for (const child of this._windowCursorSprite.children) {
                child.bitmap = this._windowskin;
            }
            this._setRectPartsGeometry(this._windowCursorSprite, srect, drect, m);
        };

        // TDS Text Effects
        _TDS_.TextEffects.Window_Base__createAllParts = Window.prototype._createAllParts;
    },
});
