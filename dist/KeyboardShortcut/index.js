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
    onActivate() {
        this._isPressed.setValue(false);
        KeyboardShortcut.getShortcutsArray(this.props.keyCombination).addValue(this);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            KeyboardShortcut.getShortcutsArray(this.props.keyCombination).removeValue(this);
        }));
        this.cancelOnDeactivate(KeyboardWatcher_1.KeyboardWatcher.instance.keys.didChange.subscribe(() => {
            const isActive = this.props.keyCombination.every((key) => {
                return KeyboardWatcher_1.KeyboardWatcher.instance.keys.hasValue(key);
            });
            if (isActive == false) {
                this._isPressed.setValue(false);
                return;
            }
            const shortcuts = KeyboardShortcut.getShortcutsArray(this.props.keyCombination);
            if (shortcuts.toOptionalValueGivenIndex(shortcuts.count - 1) == this) {
                this._isPressed.setValue(isActive == true);
            }
            else {
                this._isPressed.setValue(false);
            }
        }));
        this.cancelOnDeactivate(this._isPressed.didChange.subscribe((isPressed) => {
            if (isPressed && this.props.onPress != null) {
                this.props.onPress();
            }
        }, true));
    }
}
exports.KeyboardShortcut = KeyboardShortcut;
KeyboardShortcut.shortcutsByKeyCombination = new Map();
//# sourceMappingURL=index.js.map