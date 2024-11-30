nwcompat.patches.push({
    stage: "onload",
    target: "omori",
    name: "pixi",
    patch: () => {
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
    },
});
