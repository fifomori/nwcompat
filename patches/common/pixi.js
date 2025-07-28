nwcompat.patches.push({
    stage: "preload",
    target: "common",
    name: "pixi",
    patch: () => {
        PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2;

        // rpg_core: around ShaderTilemap ctor
        PIXI.tilemap.Constant.DO_CLEAR = true;

        PIXI.glCore = {
            VertexArrayObject: {},
            GLTexture: { prototype: {} },
        };

        PIXI.filters.VoidFilter = PIXI.filters.AlphaFilter;

        PIXI.tilemap.ZLayer = class extends PIXI.Container {
            constructor(tilemap, zIndex) {
                super();

                this.tilemap = tilemap;
                this.z = this.zIndex = zIndex;
            }

            clear() {
                this.children.forEach((child) => child.clear());
            }
        };

        PIXI.ticker = {
            Ticker: PIXI.Ticker,
            shared: PIXI.Ticker.shared,
        };
    },
});

nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "pixi",
    patch: () => {
        PIXI.filters = nwcompat.pixiFilters;

        // Olivia_HorrorEffects
        if (typeof Olivia !== "undefined" && typeof Olivia.HorrorEffects !== "undefined") {
            const oSprite = { initialize: Sprite.prototype.initialize };
            Sprite.prototype.initialize = function () {
                oSprite.initialize.call(this, ...arguments);
                this._filters = [];
                this.filters = this._filters;
            };
        }

        //-----------------------------------------------
        // CORE
        //-----------------------------------------------

        // TODO: paddings for ToneFilter, Sprite.voidFilter

        // Canvas renderer is deprecated
        Graphics.isWebGL = function () {
            return true;
        };

        Graphics._createRenderer = function () {
            try {
                this._renderer = new PIXI.Renderer({
                    view: this._canvas,
                    width: this._width,
                    height: this._height,
                    resolution: 1,
                    useContextAlpha: false,
                });

                // https://github.com/bfanger/pixi-inspector
                Object.defineProperty(globalThis, "__PIXI_STAGE__", {
                    get() {
                        return SceneManager._scene;
                    },
                });
                globalThis.__PIXI_RENDERER__ = this._renderer;
            } catch (e) {
                this._renderer = null;
            }
        };

        // copied from rpgmv
        Sprite.prototype._render = function (renderer) {
            if (this.bitmap) {
                this.bitmap.touch();
            }
            if (this.bitmap && !this.bitmap.isReady()) {
                return;
            }
            if (this.texture.frame.width > 0 && this.texture.frame.height > 0) {
                if (this._bitmap) {
                    this._bitmap.checkDirty();
                }

                // PIXI.Sprite.prototype._render
                this.calculateVertices();
                renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
                renderer.plugins[this.pluginName].render(this);
            }
        };

        ShaderTilemap.prototype.render = PIXI.Container.prototype.render;

        TilingSprite.prototype._render = function (renderer) {
            if (this._bitmap) {
                this._bitmap.touch();
                this._bitmap.checkDirty();
            }

            PIXI.extras.PictureTilingSprite.prototype._render.call(this, ...arguments);
        };

        TilingSprite.prototype.updateTransform = function () {
            this.origin.x %= this.texture.width;
            this.origin.y %= this.texture.height;

            this.tilePosition.x = Math.round(-this.origin.x);
            this.tilePosition.y = Math.round(-this.origin.y);

            PIXI.extras.TilingSprite.prototype.updateTransform.call(this, ...arguments);
        };

        // WindowLayer backported from MZ
        /**
         * @param {PixiJS.Graphics} graphics
         */
        Window.prototype.drawShape = function (graphics) {
            if (graphics) {
                const width = this.width;
                const height = (this.height * this._openness) / 255;
                const x = this.x;
                const y = this.y + (this.height - height) / 2;
                graphics.beginFill(0xffffff);
                graphics.drawRect(x, y, width, height);
                graphics.endFill();
            }
        };

        WindowLayer.prototype.initialize = function () {
            PIXI.Container.call(this);
            this._width = 0;
            this._height = 0;
            this._tempCanvas = null;
            this._translationMatrix = [1, 0, 0, 0, 1, 0, 0, 0, 1];

            this._windowMask = new PIXI.Graphics();
            this._windowMask.beginFill(0xffffff, 1);
            this._windowMask.drawRect(0, 0, 0, 0);
            this._windowMask.endFill();
            this._windowRect = this._windowMask.geometry.graphicsData[0].shape;

            this._renderSprite = null;
            this.filterArea = new PIXI.Rectangle();
            this.filters = [WindowLayer.voidFilter];
        };

        /**
         * @param {PixiJS.Renderer} renderer
         */
        WindowLayer.prototype.render = function (renderer) {
            if (!this.visible || !this.renderable) {
                return;
            }

            if (this.children.length == 0) {
                return;
            }

            renderer.batch.flush();
            this.filterArea.copyFrom(this);
            renderer.filter.push(this, this.filters);
            renderer.batch.currentRenderer.start();

            var shift = new PIXI.Point();
            var projectionMatrix = renderer.projection.projectionMatrix;
            shift.x = Math.round(((projectionMatrix.tx + 1) / 2) * renderer.projection.sourceFrame.width);
            shift.y = Math.round(((projectionMatrix.ty + 1) / 2) * renderer.projection.sourceFrame.height);

            for (var i = 0; i < this.children.length; i++) {
                var child = this.children[i];
                if (child._isWindow && child.visible && child.openness > 0) {
                    this._maskWindow(child, shift);

                    const maskData = new PIXI.MaskData();
                    maskData.autoDetect = false;
                    maskData.type = PIXI.MASK_TYPES.SCISSOR;

                    maskData._scissorRectLocal = this._windowRect;

                    renderer.mask.push(child, maskData);
                    renderer.renderTexture.clear();
                    renderer.mask.pop(child);

                    renderer.batch.currentRenderer.start();
                    child.render(renderer);
                    renderer.batch.currentRenderer.flush();
                }
            }

            renderer.batch.flush();
            renderer.filter.pop();

            for (var j = 0; j < this.children.length; j++) {
                if (!this.children[j]._isWindow) {
                    this.children[j].render(renderer);
                }
            }
        };

        //-----------------------------------------------
        // SPRITES
        //-----------------------------------------------

        const oSpriteset_Map = { updateTilemap: Spriteset_Map.prototype.updateTilemap };
        Spriteset_Map.prototype.updateTilemap = function () {
            oSpriteset_Map.updateTilemap.call(this, ...arguments);

            if (this._tilemap.bitmaps) {
                if (!this.isTilesetReady && this._tilemap.bitmaps.every((bitmap) => bitmap.isRequestReady())) {
                    this._tilemap.refresh();
                    this._tilemap.refreshTileset();
                    this.isTilesetReady = true;
                }
            }
        };
    },
});
