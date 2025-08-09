// main.js
nwcompat.runPatches("presetup");
PluginManager.setup($plugins);
window.onload = function () {
    nwcompat.loadData();
    nwcompat.runPatches("onload");
    SceneManager.run(Scene_Boot);
};
