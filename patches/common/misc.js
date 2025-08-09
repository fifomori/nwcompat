nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "misc",
    patch: () => {
        Utils.isMobileDevice = function () {
            return false;
        };

        const oSceneManager = { changeScene: SceneManager.changeScene };
        SceneManager.changeScene = function () {
            oSceneManager.changeScene.call(this, ...arguments);
            nwcompat.gamepad.connected = true;

            // should run only once
            SceneManager.changeScene = oSceneManager.changeScene;
        };

        const oTouchInput = { _onTouchStart: TouchInput._onTouchStart };
        TouchInput._onTouchStart = function () {
            if (this._touchInputEnabled) oTouchInput._onTouchStart.call(this, ...arguments);
        };

        TouchInput._toggleTouchInput = function () {
            this._touchInputEnabled = !this._touchInputEnabled;
        };

        const oBitmap = { drawText: Bitmap.prototype.drawText };
        // fix "The provided value 'undefined' is not a valid enum value of type CanvasTextAlign."
        Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align = "start") {
            oBitmap.drawText.call(this, text, x, y, maxWidth, lineHeight, align);
        };
    },
});
