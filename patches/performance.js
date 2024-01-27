nwcompat.patches.push({
    preload: false,
    patch: () => {
        // dirty
        const oHTMLCanvasElement = { getContext: HTMLCanvasElement.prototype.getContext };
        HTMLCanvasElement.prototype.getContext = function () {
            if (arguments[0] == "2d") {
                return oHTMLCanvasElement.getContext.call(this, "2d", { willReadFrequently: true });
            } else {
                return oHTMLCanvasElement.getContext.call(this, ...arguments);
            }
        };

        // TODO: fuck classes
        DataManager = class extends DataManager {
            static loadGlobalInfo() {
                if (!this._globalInfo) {
                    this._globalInfo = super.loadGlobalInfo();
                }
                return this._globalInfo;
            }

            static saveGlobalInfo(info) {
                this._globalInfo = null;
                super.saveGlobalInfo(info);
            }
        };

        // Backported from MZ
        const oWindow_Base = { _createAllParts: Window_Base.prototype._createAllParts };

        Window_Base.prototype._createAllParts = function () {
            oWindow_Base._createAllParts.call(this, ...arguments);
            // _createBackSprite
            this._windowBackSprite.addChild(new TilingSprite());
            // _createFrameSprite
            for (let i = 0; i < 8; i++) {
                this._windowFrameSprite.addChild(new Sprite());
            }
        };

        Window_Base.prototype._setRectPartsGeometry = function (sprite, srect, drect, m) {
            const sx = srect.x;
            const sy = srect.y;
            const sw = srect.width;
            const sh = srect.height;
            const dx = drect.x;
            const dy = drect.y;
            const dw = drect.width;
            const dh = drect.height;
            const smw = sw - m * 2;
            const smh = sh - m * 2;
            const dmw = dw - m * 2;
            const dmh = dh - m * 2;
            const children = sprite.children;
            sprite.setFrame(0, 0, dw, dh);
            sprite.move(dx, dy);
            // corner
            children[0].setFrame(sx, sy, m, m);
            children[1].setFrame(sx + sw - m, sy, m, m);
            children[2].setFrame(sx, sy + sw - m, m, m);
            children[3].setFrame(sx + sw - m, sy + sw - m, m, m);
            children[0].move(0, 0);
            children[1].move(dw - m, 0);
            children[2].move(0, dh - m);
            children[3].move(dw - m, dh - m);
            // edge
            children[4].move(m, 0);
            children[5].move(m, dh - m);
            children[6].move(0, m);
            children[7].move(dw - m, m);
            children[4].setFrame(sx + m, sy, smw, m);
            children[5].setFrame(sx + m, sy + sw - m, smw, m);
            children[6].setFrame(sx, sy + m, m, smh);
            children[7].setFrame(sx + sw - m, sy + m, m, smh);
            children[4].scale.x = dmw / smw;
            children[5].scale.x = dmw / smw;
            children[6].scale.y = dmh / smh;
            children[7].scale.y = dmh / smh;
            // center
            if (children[8]) {
                children[8].setFrame(sx + m, sy + m, smw, smh);
                children[8].move(m, m);
                children[8].scale.x = dmw / smw;
                children[8].scale.y = dmh / smh;
            }
            for (const child of children) {
                child.visible = dw > 0 && dh > 0;
            }
        };

        Window_Base.prototype._refreshBack = function () {
            const m = this._margin;
            const w = Math.max(0, this._width - m * 2);
            const h = Math.max(0, this._height - m * 2);
            const sprite = this._windowBackSprite;
            const tilingSprite = sprite.children[0];
            // [Note] We use 95 instead of 96 here to avoid blurring edges.
            sprite.bitmap = this._windowskin;
            sprite.setFrame(0, 0, 95, 95);
            sprite.move(m, m);
            sprite.scale.x = w / 95;
            sprite.scale.y = h / 95;
            tilingSprite.bitmap = this._windowskin;
            tilingSprite.setFrame(0, 96, 96, 96);
            tilingSprite.move(0, 0, w, h);
            tilingSprite.scale.x = 1 / sprite.scale.x;
            tilingSprite.scale.y = 1 / sprite.scale.y;
            sprite.setColorTone(this._colorTone);
        };

        Window_Base.prototype._refreshFrame = function () {
            const drect = { x: 0, y: 0, width: this._width, height: this._height };
            const srect = { x: 96, y: 0, width: 96, height: 96 };
            const m = 24;
            for (const child of this._windowFrameSprite.children) {
                child.bitmap = this._windowskin;
            }
            this._setRectPartsGeometry(this._windowFrameSprite, srect, drect, m);
        };

        // TODO: _refreshCursor
    },
});
