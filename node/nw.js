module.exports = {
    App: {
        argv: [`--${nwcompat.nativeInfo.key}`],
    },
    Screen: {
        Init: () => {},
        on: () => {},
    },
    Window: {
        get: () => {
            return {
                isFullscreen: false,
                x: window.screenX,
                y: window.screenY,
                enterFullscreen: () => {},
                leaveFullscreen: () => {},
                isDevToolsOpen: () => false,
                showDevTools: () => {},
                closeDevTools: () => {},
                moveTo: () => {},
                on: () => {},
                focus: () => {},
                close: () => window.close(),
            };
        },
    },
    Shell: {
        openExternal: (url) => {},
    },
    Menu: class {
        constructor() {
            this.createMacBuiltin = () => {};
        }
    },
};
