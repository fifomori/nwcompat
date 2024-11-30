require("./common/pixi");
require("./common/performance");
nwcompat.runPatches("preload");

require("./omori/pixi");
require("./omori/misc");
require("./omori/plugins_undo");
require("./omori/performance");
require("./omori/oneloader");
require("./omori/YSP_VideoPlayer");
nwcompat.runPatches(true, "omori");
