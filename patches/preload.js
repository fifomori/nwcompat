nwcompat.patches.push({
    preload: true,
    patch: () => {
        PIXI.settings.PREFER_ENV = PIXI.ENV.WEBGL2;

        // rpg_core: around ShaderTilemap ctor
        PIXI.tilemap.Constant.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;
        PIXI.tilemap.Constant.DO_CLEAR = true;

        PIXI.glCore = {
            VertexArrayObject: {},
            GLTexture: { prototype: {} },
        };

        PIXI.filters.VoidFilter = PIXI.filters.AlphaFilter;

        nwcompat.gamepad = {
            id: "xbox",
            connected: true,
            axes: [0, 0],
            buttons: [
                { pressed: false }, // 0: A
                { pressed: false }, // 1: B
                { pressed: false }, // 2: X
                { pressed: false }, // 3: Y
                { pressed: false }, // 4: LB
                { pressed: false }, // 5: RB
                { pressed: false }, // 6: unused
                { pressed: false }, // 7: unused
                { pressed: false }, // 8: unused
                { pressed: false }, // 9: unused
                { pressed: false }, // 10: unused
                { pressed: false }, // 11: unused
                { pressed: false }, // 12: D-pad up
                { pressed: false }, // 13: D-pad down
                { pressed: false }, // 14: D-pad left
                { pressed: false }, // 15: D-pad right
            ],
        };

        navigator.getGamepads = () => {
            return [nwcompat.gamepad];
        };

        // AudioStreaming.js
        window.fetch = () => new Promise((resolve, reject) => resolve());
    },
});
