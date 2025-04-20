// Log to console instead of file
window._logLine = function (text) {
    console.log(`[OneLoader] ${text}`);
};

// Don't install DevTools vfs
_modLoader_install_debugger_vfs = function () {};
