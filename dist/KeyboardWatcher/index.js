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
            this._keys.addValue(e.key);
        };
        this.onKeyUp = (e) => {
            this._keys.removeValue(e.key);
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
        window.addEventListener("keydown", this.onKeyDown);
        window.addEventListener("keyup", this.onKeyUp);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            window.removeEventListener("keydown", this.onKeyDown);
            window.removeEventListener("keyup", this.onKeyUp);
        }));
    }
}
exports.KeyboardWatcher = KeyboardWatcher;
//# sourceMappingURL=index.js.map