nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "misc",
    patch: () => {
        Utils.isMobileDevice = function () {
            return false;
        };

        [
            "_onMouseDown",
            "_onMouseMove",
            "_onMouseUp",
            "_onWheel",
            "_onTouchStart",
            "_onTouchMove",
            "_onTouchEnd",
            "_onTouchCancel",
            "_onPointerDown",
        ].forEach((functionName) => {
            const oFunction = TouchInput[functionName];
            TouchInput[functionName] = function () {
                if (this._touchInputEnabled) oFunction.call(this, ...arguments);
            };
        });

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
