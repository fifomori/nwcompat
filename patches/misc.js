nwcompat.patches.push({
    preload: false,
    patch: () => {
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
