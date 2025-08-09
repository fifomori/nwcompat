nwcompat.patches.push({
    stage: "onload",
    target: "common",
    name: "gamepad",
    patch: () => {
        const { layouts, VirtualGamepad, Draggable, Pad, Button } = require("virtual-gamepad");
        const targetLayout = layouts.xbox;

        new VirtualGamepad(0, targetLayout.id);

        navigator.getGamepads = function () {
            return [VirtualGamepad.instance];
        };

        const gamepadRoot = document.querySelector(".nwcompat-gamepad");
        const initialButtonSize = nwcompat.savedData.gamepad.buttonSize || 56;
        gamepadRoot.style.setProperty("--nwcompat-gamepad-button-size", `${initialButtonSize}px`);

        const gamepadEditor = document.createElement("div");
        gamepadEditor.className = "editor";
        gamepadRoot.appendChild(gamepadEditor);

        const sizeSlider = document.createElement("input");
        sizeSlider.type = "range";
        sizeSlider.min = "32";
        sizeSlider.max = "64";
        sizeSlider.value = initialButtonSize;
        sizeSlider.addEventListener("input", (e) => {
            const size = e.target.value;
            gamepadRoot.style.setProperty("--nwcompat-gamepad-button-size", `${size}px`);
        });
        gamepadEditor.appendChild(sizeSlider);

        const saveButton = document.createElement("button");
        saveButton.textContent = "Save";
        saveButton.addEventListener("click", () => {
            Draggable.inEditMode = false;
            gamepadRoot.classList.remove("edit");

            nwcompat.savedData.gamepad.buttonSize = parseInt(sizeSlider.value, 10);

            for (const draggable of Draggable.draggables) {
                nwcompat.savedData.gamepad.buttons[draggable.el.id] = {
                    inset: draggable.options.inset,
                };
            }
            nwcompat.saveData();
        });

        gamepadEditor.appendChild(saveButton);

        Input._editControls = function () {
            Draggable.inEditMode = true;
            gamepadRoot.classList.add("edit");
        };

        const makeWrapper = (id) => {
            const wrapper = document.createElement("div");
            wrapper.id = id;
            wrapper.className = "pad-wrap";

            gamepadRoot.appendChild(wrapper);
            return wrapper;
        };

        const makePad = (id, anchor, buttonOptions) => {
            const savedControlData = nwcompat.savedData.gamepad.buttons[id];
            const inset = savedControlData ? savedControlData.inset : { x: 16, y: 64 };

            const wrapper = makeWrapper(id);
            const draggable = new Draggable(wrapper, { anchor, inset });
            const pad = new Pad(wrapper, {
                buttons: buttonOptions,
                style: "round",
            });

            return [draggable, pad];
        };

        const makeTrigger = (id, anchor, label, index) => {
            const savedControlData = nwcompat.savedData.gamepad.buttons[id];
            const inset = savedControlData ? savedControlData.inset : { x: 24, y: 8 };

            const wrapper = makeWrapper(id);
            const draggable = new Draggable(wrapper, { anchor, inset });
            const button = new Button(wrapper, {
                label,
                index,
                style: "square",
            });

            return [draggable, button];
        };

        const dpadButtons = {
            up: { index: 12, label: "" },
            down: { index: 13, label: "" },
            left: { index: 14, label: "" },
            right: { index: 15, label: "" },
        };

        makePad("pad-left", { x: "left", y: "bottom" }, dpadButtons);
        makePad("pad-right", { x: "right", y: "bottom" }, targetLayout.buttons);

        makeTrigger("trigger-left", { x: "left", y: "top" }, "LB", 4);
        makeTrigger("trigger-right", { x: "right", y: "top" }, "RB", 5);
    },
});
