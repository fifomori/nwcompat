/// <reference path="../intellisense.d.ts"/>

nwcompat.patches.push({
    stage: "onload",
    name: "misc",
    patch: () => {
        // fps counter based on https://github.com/mrdoob/stats.js

        const PR = Math.round(window.devicePixelRatio || 1);
        const WIDTH = 80 * PR;
        const HEIGHT = 48 * PR;
        const TEXT_X = 3 * PR;
        const TEXT_Y = 2 * PR;
        const GRAPH_X = 3 * PR;
        const GRAPH_Y = 15 * PR;
        const GRAPH_WIDTH = 74 * PR;
        const GRAPH_HEIGHT = 30 * PR;

        class Panel {
            min = Infinity;
            max = 0;

            name;
            bg;
            fg;

            /** @type {HTMLCanvasElement} */
            dom;

            /** @type {CanvasRenderingContext2D} */
            context;

            constructor(name, fg, bg) {
                this.name = name;
                this.fg = fg;
                this.bg = bg;

                this.dom = document.createElement("canvas");
                this.dom.width = WIDTH;
                this.dom.height = HEIGHT;
                this.dom.style.cssText = "width: 80px; height: 48px";

                this.context = this.dom.getContext("2d");
                this.context.font = `bold ${9 * PR}px Helvetica, Arial, sans-serif`;
                this.context.textBaseline = "top";

                this.context.fillStyle = bg;
                this.context.fillRect(0, 0, WIDTH, HEIGHT);

                this.context.fillStyle = fg;
                this.context.fillText(name, TEXT_X, TEXT_Y);
                this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);

                this.context.fillStyle = bg;
                this.context.globalAlpha = 0.9;
                this.context.fillRect(GRAPH_X, GRAPH_Y, GRAPH_WIDTH, GRAPH_HEIGHT);
            }

            update(value, maxValue) {
                this.min = Math.min(this.min, value);
                this.max = Math.max(this.max, value);

                this.context.fillStyle = this.bg;
                this.context.globalAlpha = 1;
                this.context.fillRect(0, 0, WIDTH, GRAPH_Y);

                this.context.fillStyle = this.fg;
                this.context.fillText(
                    `${Math.round(value)} ${this.name} (${Math.round(this.min)}-${Math.round(this.max)})`,
                    TEXT_X,
                    TEXT_Y
                );

                this.context.drawImage(
                    this.dom,
                    GRAPH_X + PR,
                    GRAPH_Y,
                    GRAPH_WIDTH - PR,
                    GRAPH_HEIGHT,
                    GRAPH_X,
                    GRAPH_Y,
                    GRAPH_WIDTH - PR,
                    GRAPH_HEIGHT
                );

                this.context.fillRect(GRAPH_X + GRAPH_WIDTH - PR, GRAPH_Y, PR, GRAPH_HEIGHT);

                this.context.fillStyle = this.bg;
                this.context.globalAlpha = 0.9;
                this.context.fillRect(
                    GRAPH_X + GRAPH_WIDTH - PR,
                    GRAPH_Y,
                    PR,
                    Math.round((1 - value / maxValue) * GRAPH_HEIGHT)
                );
            }
        }

        class Stats {
            beginTime = 0;
            prevTime = 0;
            frames = 0;

            /** @type {HTMLDivElement} */
            dom;

            /** @type {Panel} */
            fpsPanel;

            /** @type {Panel} */
            msPanel;

            constructor() {
                this.dom = document.createElement("div");
                this.dom.style.cssText = "position: fixed; top: 16px; left: 32px; opacity: 0.9; z-index: 10000;";

                this.beginTime = performance.now();
                this.prevTime = this.beginTime;
                this.frames = 0;

                this.fpsPanel = this.addPanel(new Panel("FPS", "#0ff", "#002"));
                this.msPanel = this.addPanel(new Panel("MS", "#0f0", "#020"));

                this.setMode(0);
            }

            /** @argument {Panel} panel */
            addPanel(panel) {
                this.dom.appendChild(panel.dom);
                return panel;
            }

            setMode(mode) {
                for (var i = 0; i < this.dom.children.length; i++) {
                    this.dom.children[i].style.display = i === mode ? "block" : "none";
                }

                this.mode = mode;
            }

            begin() {
                this.beginTime = performance.now();
            }

            end() {
                this.frames++;

                const time = performance.now();
                this.msPanel.update(time - this.beginTime, 200);

                if (time >= this.prevTime + 1000) {
                    this.fpsPanel.update((this.frames * 1000) / (time - this.prevTime), 100);

                    this.prevTime = time;
                    this.frames = 0;
                }

                return time;
            }

            update() {
                this.beginTime = this.end();
            }
        }

        Omori_FPSCounter.prototype.initialize = function () {
            this._stats = new Stats();
            this._stats.dom.addEventListener("click", (event) => {
                event.preventDefault();
                this.switchMode();
            });

            this._mode = -1;
            this.hide();

            document.body.appendChild(this._stats.dom);
        };

        Omori_FPSCounter.prototype.startTick = function () {
            this._stats.begin();
        };

        Omori_FPSCounter.prototype.endTick = function () {
            this._stats.end();
        };

        Omori_FPSCounter.prototype.switchMode = function () {
            this._visible = true;
            if (this._mode + 1 > 1) this._mode = 0;
            else this._mode++;

            this._stats.setMode(this._mode);
        };

        Omori_FPSCounter.prototype.toggle = function () {
            this._visible ? this.hide() : this.show();
        };

        Omori_FPSCounter.prototype.show = function () {
            this._visible = true;
            if (this._mode == -1) this._mode = 0;
            this._stats.setMode(this._mode);
        };

        Omori_FPSCounter.prototype.hide = function () {
            this._visible = false;
            this._stats.setMode(-1);
        };

        Graphics._toggleFPSCounter = function () {
            this._fpsMeter.toggle();
        };

        const oWindow_OmoMenuOptionsGeneral = {
            makeOptionsList: Window_OmoMenuOptionsGeneral.prototype.makeOptionsList,
            processOptionCommand: Window_OmoMenuOptionsGeneral.prototype.processOptionCommand,
        };

        // remove resolution and fullscreen options
        Window_OmoMenuOptionsGeneral.prototype.makeOptionsList = function () {
            oWindow_OmoMenuOptionsGeneral.makeOptionsList.call(this, ...arguments);
            this._optionsList = this._optionsList.slice(2);
        };

        // skip resolution and fullscreen options when changing options
        Window_OmoMenuOptionsGeneral.prototype.processOptionCommand = function () {
            this._index += 2;
            this._optionsList.unshift(null, null);

            oWindow_OmoMenuOptionsGeneral.processOptionCommand.call(this, ...arguments);

            this._index -= 2;
            this._optionsList = this._optionsList.slice(2);
        };
    },
});
