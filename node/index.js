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

module.exports["./js/libs/greenworks"] = module.exports["./greenworks"] = require("./greenworks");
module.exports["nw.gui"] = window.nw = require("./nw");

module.exports["os"] = {
    platform: () => process.platform,
};
