nwcompat.patches.push({
    stage: "scriptload",
    target: "common",
    name: "performance",
    scripts: ["YEP_EventCopier", "YEP_EventMorpher", "YEP_EventSpawner"],
    patch: (script) => {
        /*
        Yanfly.loadMapData = function(mapId) {
            ...
            if(!!Utils.isOptionValid("test")) {
                ...
            }
            else {
                const path = require('path');
                const fs = require('fs');
                var base = path.dirname(process.mainModule.filename);
                let filename = 'Map%1.KEL'.format(mapId.padZero(3));
                Yanfly.PreloadedMaps[mapId] = null;

                // replacing this
                fs.readFile(base + "/data/" + filename, (err, data) => {
                    data = Encryption.decrypt(data);
                    Yanfly.PreloadedMaps[mapId] = JSON.parse(data.toString());
                })
                
                // with this
                const buffer = fs.readFileSync(`${base}/data/${filename}`);
                const data = Encryption.decrypt(buffer);
                Yanfly.PreloadedMaps[mapId] = JSON.parse(data.toString());
                
                // so it doesn't reading same file 1000 times because of async shit (reduces boot time from 90 to 25 seconds)
            }
        };
        */
        const search =
            '\t\tfs.readFile(base + "/data/" + filename, (err, data) => {\n\t\t\tdata = Encryption.decrypt(data);\n\t\t\tYanfly.PreloadedMaps[mapId] = JSON.parse(data.toString());\n\t\t})';
        const replace =
            "const buffer = fs.readFileSync(`${base}/data/${filename}`);const data = Encryption.decrypt(buffer);Yanfly.PreloadedMaps[mapId] = JSON.parse(data.toString());";

        script.source = script.source.replace(search, replace);
    },
});

nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "performance",
    patch: () => {
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

        const common_createBackgroundBlurred = function () {
            console.debug("common_createBackgroundBlurred", this);

            const blur = new PIXI.filters.BlurFilter();
            blur.blur = 1;
            blur.padding = 0;

            this._backgroundSprite = SceneManager._backgroundSprite;
            this._backgroundSprite.filters = [blur];
        };

        Scene_MenuBase.prototype.createBackground = function () {
            common_createBackgroundBlurred.call(this);
            this.addChild(this._backgroundSprite);
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

        const oDataManager = {
            loadGlobalInfo: DataManager.loadGlobalInfo,
            saveGlobalInfo: DataManager.saveGlobalInfo,
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
    },
});
