require("./common/loader");
require("./common/misc");
require("./common/pixi");
require("./common/performance");

require("./omori/loader");
require("./omori/pixi");
require("./omori/misc");
require("./omori/plugins_undo");
require("./omori/performance");
require("./omori/oneloader");
require("./omori/YSP_VideoPlayer");

nwcompat.runPatches("preload");
