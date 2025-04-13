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
};

const jsYaml = require("js-yaml");
module.exports["./js/libs/js-yaml-master"] = {
    ...jsYaml,
    safeDump: jsYaml.dump,
    safeLoad: jsYaml.load,
    safeLoadAll: jsYaml.loadAll,
};

const greenworks = require("./greenworks");
module.exports["./js/libs/greenworks"] = module.exports["./greenworks"] = greenworks;

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
                isDevToolsOpen: () => false,
                showDevTools: () => {},
                closeDevTools: () => {},
                moveTo: () => {},
                on: () => {},
                focus: () => {},
                close: () => window.close(),
            };
        },
    },
    Shell: {
        openExternal: (url) => {},
    },
    Menu: class {
        constructor() {
            this.createMacBuiltin = () => {};
        }
    },
};
