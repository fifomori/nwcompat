const layouts = {
    playstation: {
        id: "playstation",
        buttons: {
            down: { index: 0, label: "X" },
            right: { index: 1, label: "O" },
            left: { index: 2, label: "[]" },
            up: { index: 3, label: "^" },
        },
    },
    xbox: {
        id: "xbox",
        buttons: {
            down: { index: 0, label: "A" },
            right: { index: 1, label: "B" },
            left: { index: 2, label: "X" },
            up: { index: 3, label: "Y" },
        },
    },
    switch: {
        id: "switch",
        buttons: {
            down: { index: 0, label: "B" },
            right: { index: 1, label: "A" },
            left: { index: 2, label: "Y" },
            up: { index: 3, label: "X" },
        },
    },
};

class VirtualGamepad {
    static instance = null;

    constructor(index, id) {
        if (VirtualGamepad.instance) {
            throw new Error("VirtualGamepad instance already exists");
        }
        VirtualGamepad.instance = this;

        this.index = index;
        this.id = id;

        this.axes = [0, 0];
        this.mapping = "standard";
        this.connected = true;
        this.buttons = [
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
        ];
    }
}

class Draggable {
    static inEditMode = false;
    static draggables = [];

    /**
     * @param {HTMLElement} el
     * @param {Object} options
     * @param {Object} options.anchor
     * @param {string} options.anchor.x "left" or "right"
     * @param {string} options.anchor.y "top" or "bottom"
     * @param {number} options.inset.x
     * @param {number} options.inset.y
     */
    constructor(el, options) {
        this.el = el;
        this.options = options;

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerEnd = this._onPointerEnd.bind(this);

        this.el.style[this.options.anchor.x] = this.options.inset.x + "px";
        this.el.style[this.options.anchor.y] = this.options.inset.y + "px";

        this.el.addEventListener("pointerdown", this._onPointerDown);
        this.el.addEventListener("pointermove", this._onPointerMove);
        this.el.addEventListener("pointerup", this._onPointerEnd);
        this.el.addEventListener("pointercancel", this._onPointerEnd);

        this._prevClientX = null;
        this._prevClientY = null;

        Draggable.draggables.push(this);
    }

    #updateStyle() {
        const { x, y } = this.options.anchor;
        this.el.style[x] = `${this.options.inset.x}px`;
        this.el.style[y] = `${this.options.inset.y}px`;
    }

    _onPointerDown(e) {
        if (!Draggable.inEditMode) return;

        this._prevClientX = e.clientX;
        this._prevClientY = e.clientY;
    }

    _onPointerMove(e) {
        if (!Draggable.inEditMode) return;
        if (this._prevClientX === null || this._prevClientY === null) return;

        const { x, y } = this.options.anchor;
        const deltaX = (x === "right" ? -1 : 1) * (e.clientX - this._prevClientX);
        const deltaY = (y === "bottom" ? -1 : 1) * (e.clientY - this._prevClientY);

        this._prevClientX = e.clientX;
        this._prevClientY = e.clientY;

        this.options.inset.x += deltaX;
        this.options.inset.y += deltaY;

        this.#updateStyle();
    }

    _onPointerEnd(e) {
        if (!Draggable.inEditMode) return;

        this._prevClientX = null;
        this._prevClientY = null;

        this.options.inset.x = Math.round(this.options.inset.x);
        this.options.inset.y = Math.round(this.options.inset.y);

        this.#updateStyle();
    }
}

class Pad {
    /**
     * @param {HTMLElement} parent
     */
    constructor(parent, options) {
        this.options = options;

        // pointerId -> element
        this.active = new Map();

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerEnd = this._onPointerEnd.bind(this);

        [this.root, this.buttons] = this.#createDOM();

        this.root.addEventListener("pointerdown", this._onPointerDown);
        this.root.addEventListener("pointermove", this._onPointerMove);
        this.root.addEventListener("pointerup", this._onPointerEnd);
        this.root.addEventListener("pointercancel", this._onPointerEnd);

        parent.appendChild(this.root);
    }

    #createDOM() {
        const root = document.createElement("div");
        root.className = "pad";

        const buttons = [];

        const makeSpace = () => document.createElement("div");
        const makeButton = (id) => {
            const b = document.createElement("div");
            b.className = "button";
            b.id = id;
            b.textContent = this.options.buttons[id].label;
            b.classList.add(this.options.style);
            buttons.push(b);
            return b;
        };

        root.appendChild(makeSpace());
        root.appendChild(makeButton("up"));
        root.appendChild(makeSpace());

        root.appendChild(makeButton("left"));
        root.appendChild(makeSpace());
        root.appendChild(makeButton("right"));

        root.appendChild(makeSpace());
        root.appendChild(makeButton("down"));
        root.appendChild(makeSpace());

        return [root, buttons];
    }

    #getButtonAt(x, y) {
        for (const button of this.buttons) {
            const rect = button.getBoundingClientRect();
            if (x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom) {
                return button;
            }
        }
        return null;
    }

    #press(button, pointerId) {
        button.classList.add("active");
        this.active.set(pointerId, button);

        const index = this.options.buttons[button.id].index;
        VirtualGamepad.instance.buttons[index].pressed = true;
    }

    #release(button, pointerId) {
        button.classList.remove("active");
        if (pointerId != null) this.active.delete(pointerId);

        const index = this.options.buttons[button.id].index;
        VirtualGamepad.instance.buttons[index].pressed = false;
    }

    _onPointerDown(e) {
        if (Draggable.inEditMode) return;

        const button = this.#getButtonAt(e.clientX, e.clientY);
        if (!button) return;
        this.#press(button, e.pointerId);
    }

    _onPointerMove(e) {
        if (Draggable.inEditMode) return;

        const currentButton = this.#getButtonAt(e.clientX, e.clientY);
        const prevButton = this.active.get(e.pointerId);

        if (prevButton && currentButton !== prevButton) {
            this.#release(prevButton, e.pointerId);
        }

        if (currentButton && currentButton !== prevButton && e.pressure > 0) {
            this.#press(currentButton, e.pointerId);
        }
    }

    _onPointerEnd(e) {
        if (Draggable.inEditMode) return;

        const button = this.active.get(e.pointerId);
        if (button) this.#release(button, e.pointerId);
    }
}

class Button {
    /**
     * @param {HTMLElement} parent
     * @param {Object} options
     * @param {string} options.style
     * @param {string} options.label
     * @param {number} options.index VirtualGamepad.instance.buttons index
     */
    constructor(parent, options) {
        this.options = options;
        this.activePointers = new Set(); // pointerIds currently pressing this button

        this._onPointerDown = this._onPointerDown.bind(this);
        this._onPointerMove = this._onPointerMove.bind(this);
        this._onPointerEnd = this._onPointerEnd.bind(this);

        this.el = this.#createDOM();

        this.el.addEventListener("pointerdown", this._onPointerDown);
        this.el.addEventListener("pointermove", this._onPointerMove);
        this.el.addEventListener("pointerup", this._onPointerEnd);
        this.el.addEventListener("pointercancel", this._onPointerEnd);

        parent.appendChild(this.el);
    }

    #createDOM() {
        const b = document.createElement("div");
        b.className = "button";
        b.textContent = this.options.label;
        b.classList.add(this.options.style);
        return b;
    }

    #isInside(x, y) {
        const rect = this.el.getBoundingClientRect();
        return x >= rect.left && x <= rect.right && y >= rect.top && y <= rect.bottom;
    }

    #updateActiveClass() {
        if (this.activePointers.size > 0) this.el.classList.add("active");
        else this.el.classList.remove("active");
    }

    #press(id) {
        if (this.activePointers.has(id)) return;
        this.activePointers.add(id);
        this.#updateActiveClass();

        VirtualGamepad.instance.buttons[this.options.index].pressed = true;
    }

    #release(id) {
        if (!this.activePointers.has(id)) return;
        this.activePointers.delete(id);
        this.#updateActiveClass();

        VirtualGamepad.instance.buttons[this.options.index].pressed = false;
    }

    _onPointerDown(e) {
        if (Draggable.inEditMode) return;

        this.#press(e.pointerId);
    }

    _onPointerMove(e) {
        if (Draggable.inEditMode) return;

        const inside = this.#isInside(e.clientX, e.clientY);
        const active = this.activePointers.has(e.pointerId);
        if (active && !inside) {
            this.#release(e.pointerId);
        } else if (!active && inside && e.pressure > 0) {
            this.#press(e.pointerId);
        }
    }

    _onPointerEnd(e) {
        if (Draggable.inEditMode) return;

        if (this.activePointers.has(e.pointerId)) this.#release(e.pointerId);
    }
}

module.exports = {
    layouts,
    VirtualGamepad,
    Draggable,
    Pad,
    Button,
};
