// main.js
nwcompat.runPatches("omori", "presetup");
PluginManager.setup($plugins);
window.onload = function () {
    nwcompat.runPatches("omori", "onload");
    SceneManager.run(Scene_Boot);
};
