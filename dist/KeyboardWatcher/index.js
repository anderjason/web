"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
class KeyboardWatcher extends skytree_1.Actor {
    constructor() {
        super();
        this._keys = observable_1.ObservableSet.ofEmpty();
        this.keys = observable_1.ReadOnlyObservableSet.givenObservableSet(this._keys);
        this.onKeyDown = (e) => {
            if (e.repeat == true) {
                return;
            }
            let key = e.key;
            if (key.length === 1) {
                key = key.toLowerCase();
            }
            this._keys.addValue(key);
        };
        this.onKeyUp = (e) => {
            let key = e.key;
            if (key.length === 1) {
                key = key.toLowerCase();
            }
            this._keys.removeValue(key);
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