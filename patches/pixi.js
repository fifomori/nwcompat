/// <reference path="../intellisense.d.ts"/>

nwcompat.patches.push({
    stage: "preload",
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
    name: "pixi",
    patch: () => {
        PIXI.filters = nwcompat.pixiFilters;

        // Olivia_HorrorEffects
        const oSprite = { initialize: Sprite.prototype.initialize };
        Sprite.prototype.initialize = function () {
            oSprite.initialize.call(this, ...arguments);
            this._filters = [];
            this.filters = this._filters;
        };

        // FilterController
        Filter_Controller.filterNameMap["bulgepinch"] = PIXI.filters.BulgePinchFilter;
        Filter_Controller.filterNameMap["radialblur"] = PIXI.filters.RadialBlurFilter;
        Filter_Controller.filterNameMap["godray"] = PIXI.filters.GodrayFilter;
        Filter_Controller.filterNameMap["ascii"] = PIXI.filters.AsciiFilter;
        Filter_Controller.filterNameMap["crosshatch"] = PIXI.filters.CrossHatchFilter;
        Filter_Controller.filterNameMap["dot"] = PIXI.filters.DotFilter;
        Filter_Controller.filterNameMap["emboss"] = PIXI.filters.EmbossFilter;
        Filter_Controller.filterNameMap["shockwave"] = PIXI.filters.ShockwaveFilter;
        Filter_Controller.filterNameMap["twist"] = PIXI.filters.TwistFilter;
        Filter_Controller.filterNameMap["zoomblur"] = PIXI.filters.ZoomBlurFilter;
        Filter_Controller.filterNameMap["noise"] = PIXI.filters.NoiseFilter;
        Filter_Controller.filterNameMap["blur"] = PIXI.filters.BlurFilter; // -> No KawaseBlur: slow
        Filter_Controller.filterNameMap["oldfilm"] = PIXI.filters.OldFilmFilter;
        Filter_Controller.filterNameMap["rgbsplit"] = PIXI.filters.RGBSplitFilter;
        Filter_Controller.filterNameMap["bloom"] = PIXI.filters.AdvancedBloomFilter;
        Filter_Controller.filterNameMap["godray-np"] = PIXI.filters.GodrayFilter;
        Filter_Controller.filterNameMap["adjustment"] = PIXI.filters.AdjustmentFilter;
        Filter_Controller.filterNameMap["pixelate"] = PIXI.filters.PixelateFilter;
        Filter_Controller.filterNameMap["crt"] = PIXI.filters.CRTFilter;
        Filter_Controller.filterNameMap["reflection-m"] = PIXI.filters.ReflectionFilter;
        Filter_Controller.filterNameMap["reflection-w"] = PIXI.filters.ReflectionFilter;
        Filter_Controller.filterNameMap["motionblur"] = PIXI.filters.MotionBlurFilter;
        Filter_Controller.filterNameMap["glow"] = PIXI.filters.GlowFilter;
        Filter_Controller.filterNameMap["displacement"] = PIXI.filters.DisplacementFilter;

        const oPIXI_tilemap_CompositeRectTileLayer = PIXI.tilemap.CompositeRectTileLayer;

        // YED_Tiled compatibility
        PIXI.tilemap.CompositeRectTileLayer = function (zIndex) {
            const ret = new oPIXI_tilemap_CompositeRectTileLayer();
            ret.z = ret.zIndex = zIndex;
            return ret;
        };

        const oScene_Battle = { updateMainToneFilter: Scene_Battle.prototype.updateMainToneFilter };

        // GTP_OmoriFixes objects[0].filters fix
        Scene_Battle.prototype.updateMainToneFilter = function () {
            if (!this._stressBar.filters) {
                this._stressBar.filters = [];
            }
            return oScene_Battle.updateMainToneFilter.call(this, ...arguments);
        };

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
                globalThis.__PIXI_STAGE__ = SceneManager._scene;
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

        ShaderTilemap.prototype.render = function (renderer) {
            // TODO: why hack
            this._hackRenderer(renderer);
            PIXI.Container.prototype.render.call(this, ...arguments);
        };

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
