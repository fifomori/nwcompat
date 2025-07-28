nwcompat.patches.push({
    stage: "onload",
    target: "omori",
    name: "plugins_undo",
    patch: () => {
        const oGraphics = {
            _centerElement: Graphics._centerElement,
            _createCanvas: Graphics._createCanvas,
        };

        // Archeia_CoreChanges: remove pixelation
        Graphics._centerElement = function (element) {
            oGraphics._centerElement.call(this, ...arguments);
            element.style.removeProperty("image-rendering");
            element.style.removeProperty("font-smooth");
        };

        // YEP_CoreEngine: remove resolution snapping
        Graphics._updateRealScale = function () {
            if (this._stretchEnabled) {
                var h = window.innerWidth / this._width;
                var v = window.innerHeight / this._height;
                if (h >= 1 && h - 0.01 <= 1) h = 1;
                if (v >= 1 && v - 0.01 <= 1) v = 1;
                this._realScale = Math.min(h, v);
            } else {
                this._realScale = this._scale;
            }
        };

        // GTP_OmoriFixes: remove steam overlay fix because it causes overscroll
        Graphics._createCanvas = function () {
            oGraphics._createCanvas.call(this, ...arguments);
            this._overlayFix.remove();
            this._overlayFix = undefined;
        };
    },
});
