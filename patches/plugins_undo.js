/// <reference path="../intellisense.d.ts"/>

nwcompat.patches.push({
    stage: "onload",
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

        // GTP_OmoriFixes: remove steam overlay "fix" that causes overscroll
        Graphics._createCanvas = function () {
            oGraphics._createCanvas.call(this, ...arguments);
            this._overlayFix.remove();
        };

        const oSceneManager = { initGraphics: SceneManager.initGraphics };

        // GTP_OmoriFixes: undo SceneManager changes
        SceneManager.initGraphics = function () {
            oSceneManager.initGraphics.call(this, ...arguments);
            this.ticker = PIXI.Ticker.shared;
        };

        SceneManager.update = function () {
            try {
                Graphics.tickStart();
                this.updateInputData();
                this.updateManagers();
                this.updateMain();
                Graphics.tickEnd();
            } catch (e) {
                this.catchException(e);
            }
        };

        SceneManager.updateMain = function () {
            this.changeScene();
            this.updateScene();
            this.renderScene();
            this.requestUpdate();
        };

        SceneManager.requestUpdate = function () {
            if (!this._stopped) {
                requestAnimationFrame(this.update.bind(this));
            }
        };

        SceneManager.stop = function () {
            this._stopped = true;
        };

        SceneManager.isFocus = function () {
            return true;
        };
    },
});
