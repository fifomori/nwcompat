nwcompat.patches.push({
    stage: "scriptload",
    target: "instarsandtime",
    name: "loader",
    scripts: ["VE_BasicModule"],
    patch: (script) => {
        /* 
        VictorEngine.getPluginParameters = function() {
            var script = document.currentScript || (function() {
                var scripts = document.getElementsByTagName('script');
                return scripts[scripts.length - 1];
            })();
            // replace src with _url (see patches/common/loader.js)
            var start = script.src.lastIndexOf('/') + 1;
            var end = script.src.indexOf('.js');
            return PluginManager.parameters(script.src.substring(start, end));
        }
         */
        script.source = script.source.replace(/script\.src/g, "script._url");
    },
});
