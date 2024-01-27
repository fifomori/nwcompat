/// <reference path="../intellisense.d.ts"/>

globalThis.PIXI = require("pixi.js");
PIXI.tilemap = require("@pixi/tilemap");
PIXI.extras = {
    TilingSprite: PIXI.TilingSprite,
    PictureTilingSprite: PIXI.TilingSprite,
};

nwcompat.pixiFilters = {
    ...PIXI.filters,
    ...require("pixi-filters"),
};

// NodeJS
globalThis.Buffer = require("buffer").Buffer;
module.exports = {
    buffer: require("buffer"),
    crypto: require("crypto-browserify"),
    events: require("events"),
    stream: require("stream"),
    util: require("util"),
    zlib: require("browserify-zlib"),
    fs: require("./fs"),
    path: require("./path"),
    "./js/libs/greenworks": require("./greenworks"),
};

const jsYaml = require("js-yaml");
module.exports["./js/libs/js-yaml-master"] = {
    ...jsYaml,
    safeDump: jsYaml.dump,
    safeLoad: jsYaml.load,
    safeLoadAll: jsYaml.loadAll,
};

module.exports["os"] = {
    platform: () => process.platform,
};

module.exports["nw.gui"] = window.nw = {
    App: {
        argv: [`--${nwcompat.getKey()}`],
    },
    Screen: {
        Init: () => {},
        on: () => {},
    },
    Window: {
        get: () => {
            return {
                isFullscreen: false,
                x: window.screenX,
                y: window.screenY,
                enterFullscreen: () => {},
                leaveFullscreen: () => {},
                showDevTools: () => {},
                closeDevTools: () => {},
                moveTo: () => {},
                on: () => {},
                focus: () => {},
            };
        },
    },
    Menu: class {
        constructor() {
            this.createMacBuiltin = () => {};
        }
    },
};
