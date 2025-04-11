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
        };

        /**
         * @param {PixiJS.Renderer} renderer
         */
        WindowLayer.prototype.render = function (renderer) {
            if (!this.visible) {
                return;
            }

            const graphics = new PIXI.Graphics();
            const gl = renderer.gl;
            const children = this.children.clone();

            renderer.framebuffer.forceStencil();
            graphics.transform = this.transform;
            renderer.batch.flush();
            gl.enable(gl.STENCIL_TEST);

            while (children.length > 0) {
                const win = children.pop();
                if (win._isWindow && win.visible && win.openness > 0) {
                    gl.stencilFunc(gl.EQUAL, 0, ~0);
                    gl.stencilOp(gl.KEEP, gl.KEEP, gl.KEEP);
                    win.render(renderer);
                    renderer.batch.flush();
                    graphics.clear();
                    win.drawShape(graphics);
                    gl.stencilFunc(gl.ALWAYS, 1, ~0);
                    gl.stencilOp(gl.REPLACE, gl.REPLACE, gl.REPLACE);
                    gl.blendFunc(gl.ZERO, gl.ONE);
                    graphics.render(renderer);
                    renderer.batch.flush();
                    gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);
                }
            }

            gl.disable(gl.STENCIL_TEST);
            gl.clear(gl.STENCIL_BUFFER_BIT);
            gl.clearStencil(0);
            renderer.batch.flush();

            for (const child of this.children) {
                if (!child._isWindow && child.visible) {
                    child.render(renderer);
                }
            }

            renderer.batch.flush();
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
