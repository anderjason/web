"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const exactMatches = new Set([
    "F1",
    "F2",
    "F3",
    "F4",
    "F5",
    "F6",
    "F7",
    "F8",
    "F9",
    "F10",
    "F11",
    "F12",
    "Period",
    "Comma",
    "Semicolon",
    "Quote",
    "BracketLeft",
    "BracketRight",
    "Slash",
    "Backslash",
    "Backquote",
    "Tab",
    "Minus",
    "Equal",
    "Escape",
    "Enter",
    "Space",
    "Delete",
    "Shift",
    "Alt",
    "Control"
]);
function keyboardKeyGivenKeyboardEventCode(code) {
    let match = /^Key([A-Z])$/.exec(code);
    if (match != null) {
        // like KeyW -> W
        return match[1];
    }
    match = /^Digit([0-9])$/.exec(code);
    if (match != null) {
        // like Digit2 -> 2
        return match[1];
    }
    match = /^(Shift|Alt|Control)(Left|Right)$/.exec(code);
    if (match != null) {
        // like ControlLeft -> Control
        return match[1];
    }
    match = /^Arrow(Left|Right|Up|Down)$/.exec(code);
    if (match != null) {
        // like ArrowDown -> Down
        return match[1];
    }
    if (exactMatches.has(code)) {
        return code;
    }
    if (code === "Backspace") {
        return "Delete";
    }
    // console.log(`Unsupported key code '${code}'`);
    return undefined;
}
class KeyboardWatcher extends skytree_1.Actor {
    constructor() {
        super();
        this._keys = observable_1.ObservableSet.ofEmpty();
        this.keys = observable_1.ReadOnlyObservableSet.givenObservableSet(this._keys);
        this.onKeyDown = (e) => {
            if (e.repeat == true) {
                return;
            }
            const keyboardKey = keyboardKeyGivenKeyboardEventCode(e.code);
            this._keys.addValue(keyboardKey);
        };
        this.onKeyUp = (e) => {
            const keyboardKey = keyboardKeyGivenKeyboardEventCode(e.code);
            this._keys.removeValue(keyboardKey);
        };
    }
    static get instance() {
        if (KeyboardWatcher._instance == null) {
            KeyboardWatcher._instance = new KeyboardWatcher();
            KeyboardWatcher._instance.activate();
        }
        return this._instance;
    }
    onActivate() {
        if (typeof window === "undefined") {
            return;
        }
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            window.removeEventListener("keydown", this.onKeyDown);
            window.removeEventListener("keyup", this.onKeyUp);
        }));
    }
}
exports.KeyboardWatcher = KeyboardWatcher;
KeyboardWatcher.controlKey = "Control";
KeyboardWatcher.altKey = "Alt";
KeyboardWatcher.shiftKey = "Shift";
//# sourceMappingURL=index.js.map