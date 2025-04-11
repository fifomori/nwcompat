nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "misc",
    patch: () => {
        Utils.isMobileDevice = function () {
            return false;
        };

        const oSceneManager = { changeScene: SceneManager.changeScene };
        SceneManager.changeScene = function () {
            oSceneManager.changeScene.call(this, ...arguments);
            nwcompat.gamepad.connected = true;

            // should run only once
            SceneManager.changeScene = oSceneManager.changeScene;
        };
    },
});
