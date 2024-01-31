/// <reference path="intellisense.d.ts"/>

// OneLoader
if (typeof $modLoader !== "undefined") {
    // Log to console instead of file
    window._logLine = function (text) {
        console.warn(`[OneLoader] ${text}`);
    };

    // Don't install DevTools vfs
    _modLoader_install_debugger_vfs = function () {};

    const o_modLoader_runScripts = $modLoader.$runScripts;
    $modLoader.$runScripts = async function (place) {
        if (place == "pre_window_onload") nwcompat.runPatches(false);
        o_modLoader_runScripts.call(this, ...arguments);
    };
} else {
    window.addEventListener("load", () => {
        nwcompat.runPatches(false);
    });
}
