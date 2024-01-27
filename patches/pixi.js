nwcompat.patches.push({
    preload: false,
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
            var options = {
                view: this._canvas,
                width: this._width,
                height: this._height,
                resolution: 1,
                useContextAlpha: false,
            };
            try {
                this._renderer = new PIXI.Renderer(options);
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

                //copy of pixi-v6 internal code
                this.calculateVertices();

                if (this.pluginName === "sprite" && this._isPicture) {
                    renderer.batch.setObjectRenderer(renderer.plugins.picture);
                    renderer.plugins.picture.render(this);
                } else {
                    // use pixi super-speed renderer
                    renderer.batch.setObjectRenderer(renderer.plugins[this.pluginName]);
                    renderer.plugins[this.pluginName].render(this);
                }
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

        //-----------------------------------------------
        // SCENES
        //-----------------------------------------------

        // Replace WindowLayer with PIXI.Container
        Scene_Base.prototype.createWindowLayer = function () {
            this._windowLayer = new PIXI.Container();
            this.addChild(this._windowLayer);
            BattleManager.setWindowLayer(this._windowLayer); // YEP_X_ActSeqPack2
        };

        Scene_Base.prototype.addWindow = function (window) {
            this.addChild(window);
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
