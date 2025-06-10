nwcompat.patches.push({
    stage: "presetup",
    target: "instarsandtime",
    name: "performance",
    patch: () => {
        const oBitmap = { drawText: Bitmap.prototype.drawText };
        // fix "The provided value 'undefined' is not a valid enum value of type CanvasTextAlign."
        Bitmap.prototype.drawText = function (text, x, y, maxWidth, lineHeight, align = "start") {
            oBitmap.drawText.call(this, text, x, y, maxWidth, lineHeight, align);
        };
    },
});
