"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.KeyboardShortcut = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const KeyboardWatcher_1 = require("../KeyboardWatcher");
class KeyboardShortcut extends skytree_1.Actor {
    constructor() {
        super(...arguments);
        this._isPressed = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.isPressed = observable_1.ReadOnlyObservable.givenObservable(this._isPressed);
    }
    static getShortcutsArray(keyCombination) {
        const joinedCombination = keyCombination.join(",");
        let shortcuts = KeyboardShortcut.shortcutsByKeyCombination.get(joinedCombination);
        if (shortcuts == null) {
            shortcuts = observable_1.ObservableArray.ofEmpty();
            KeyboardShortcut.shortcutsByKeyCombination.set(joinedCombination, shortcuts);
        }
        return shortcuts;
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
        keyCombinations.forEach((combination) => {
            KeyboardShortcut.getShortcutsArray(combination).addValue(this);
        });
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            keyCombinations.forEach((combination) => {
                KeyboardShortcut.getShortcutsArray(combination).removeValue(this);
            });
        }));
        this.cancelOnDeactivate(KeyboardWatcher_1.KeyboardWatcher.instance.keys.didChange.subscribe(() => {
            const activeKeyCombination = keyCombinations.find((keyCombination) => {
                return keyCombination.every((key) => {
                    return KeyboardWatcher_1.KeyboardWatcher.instance.keys.hasValue(key);
                });
            });
            if (activeKeyCombination == null) {
                this._isPressed.setValue(false);
                return;
            }
            const shortcuts = KeyboardShortcut.getShortcutsArray(activeKeyCombination);
            if (shortcuts.toOptionalValueGivenIndex(shortcuts.count - 1) == this) {
                this._isPressed.setValue(activeKeyCombination != null);
            }
            else {
                this._isPressed.setValue(false);
            }
        }));
        this.cancelOnDeactivate(this._isPressed.didChange.subscribe((isPressed) => {
            if (isPressed) {
                this.props.onPress();
            }
        }, true));
    }
}
exports.KeyboardShortcut = KeyboardShortcut;
KeyboardShortcut.shortcutsByKeyCombination = new Map();
//# sourceMappingURL=index.js.map