"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardShortcut = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const KeyboardWatcher_1 = require("../KeyboardWatcher");
class KeyboardShortcut extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._isPressed = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.isPressed = observable_1.ReadOnlyObservable.givenObservable(this._isPressed);
        // any key with a single character should be lowercase
    }
    static givenKey(key, onPress) {
        const keyCombination = [key];
        return KeyboardShortcut.givenKeyCombination(keyCombination, onPress);
    }
    static givenKeyCombination(keyCombination, onPress) {
        return new KeyboardShortcut({
            keyCombinations: [keyCombination],
            onPress,
        });
    }
    static givenAnyKeyCombination(keyCombinations, onPress) {
        return new KeyboardShortcut({ keyCombinations, onPress });
    }
    onActivate() {
        const keyCombinations = this.props.keyCombinations.map((keyCombination) => {
            return keyCombination.map((key) => {
                if (key.length === 1) {
                    return key.toLowerCase();
                }
                else {
                    return key;
                }
            });
        });
        this.cancelOnDeactivate(KeyboardWatcher_1.KeyboardWatcher.instance.keys.didChange.subscribe(() => {
            this._activeKeyCombination = keyCombinations.find((keyCombination) => {
                return keyCombination.every((key) => {
                    return KeyboardWatcher_1.KeyboardWatcher.instance.keys.hasValue(key);
                });
            });
            this._isPressed.setValue(this._activeKeyCombination != null);
        }, true));
        this.cancelOnDeactivate(this._isPressed.didChange.subscribe((isPressed) => {
            if (isPressed) {
                this.props.onPress();
            }
        }, true));
    }
}
exports.KeyboardShortcut = KeyboardShortcut;
//# sourceMappingURL=index.js.map