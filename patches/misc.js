nwcompat.patches.push({
    stage: "onload",
    patch: () => {
        const Stats = require("stats-js");

        // stats.js fps counter
        Omori_FPSCounter.prototype.initialize = function () {
            this._stats = new Stats();
            this._stats.dom.style.top = "16px";
            this._stats.dom.style.left = "16px";
            document.body.appendChild(this._stats.dom);
        };

        Omori_FPSCounter.prototype.startTick = function () {
            this._stats.begin();
        };

        Omori_FPSCounter.prototype.endTick = function () {
            this._stats.end();
        };

        Omori_FPSCounter.prototype.hide = function () {};
        Omori_FPSCounter.prototype.show = function () {};

        Omori_FPSCounter.prototype.switchMode = function () {
            this._stats.dom.dispatchEvent(new Event("click"));
        };

        const oWindow_OmoMenuOptionsGeneral = {
            makeOptionsList: Window_OmoMenuOptionsGeneral.prototype.makeOptionsList,
            processOptionCommand: Window_OmoMenuOptionsGeneral.prototype.processOptionCommand,
        };

        // remove resolution and fullscreen options
        Window_OmoMenuOptionsGeneral.prototype.makeOptionsList = function () {
            oWindow_OmoMenuOptionsGeneral.makeOptionsList.call(this, ...arguments);
            this._optionsList = this._optionsList.slice(2);
        };

        // skip resolution and fullscreen options when changing options
        Window_OmoMenuOptionsGeneral.prototype.processOptionCommand = function () {
            const _index = this.index;
            this.index = function () {
                return _index.call(this, ...arguments) + 2;
            };

            this._optionsList.unshift(null, null);
            oWindow_OmoMenuOptionsGeneral.processOptionCommand.call(this, ...arguments);
            this._optionsList = this._optionsList.slice(2);

            this.index = _index;
        };
    },
});
