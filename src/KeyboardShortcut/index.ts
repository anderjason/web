import {
  Observable,
  ObservableArray,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Actor } from "skytree";
import { KeyboardKey, KeyboardWatcher } from "../KeyboardWatcher";

export type KeyCombination = KeyboardKey[];

export interface KeyboardShortcutProps {
  keyCombination: KeyCombination;

  onPress?: () => void;
}

export class KeyboardShortcut extends Actor<KeyboardShortcutProps> {
  private static shortcutsByKeyCombination = new Map<
    string,
    ObservableArray<KeyboardShortcut>
  >();

  private static getShortcutsArray(
    keyCombination: KeyCombination
  ): ObservableArray<KeyboardShortcut> {
    const joinedCombination = keyCombination.join(",");
    let shortcuts = KeyboardShortcut.shortcutsByKeyCombination.get(
      joinedCombination
    );
    if (shortcuts == null) {
      shortcuts = ObservableArray.ofEmpty();
      KeyboardShortcut.shortcutsByKeyCombination.set(
        joinedCombination,
        shortcuts
      );
    }

    return shortcuts;
  }

  private _isPressed = Observable.ofEmpty<boolean>(Observable.isStrictEqual);
  readonly isPressed = ReadOnlyObservable.givenObservable(this._isPressed);

  onActivate() {
    KeyboardShortcut.getShortcutsArray(this.props.keyCombination).addValue(this);

    this.cancelOnDeactivate(
      new Receipt(() => {
        KeyboardShortcut.getShortcutsArray(this.props.keyCombination).removeValue(this);
      })
    );

    this.cancelOnDeactivate(
      KeyboardWatcher.instance.keys.didChange.subscribe(() => {
        const isActive = this.props.keyCombination.every((key) => {
          return KeyboardWatcher.instance.keys.hasValue(key);
        });

        if (isActive == false) {
          this._isPressed.setValue(false);
          return;
        }

        const shortcuts = KeyboardShortcut.getShortcutsArray(
          this.props.keyCombination
        );

        if (shortcuts.toOptionalValueGivenIndex(shortcuts.count - 1) == this) {
          this._isPressed.setValue(isActive == true);
        } else {
          this._isPressed.setValue(false);
        }
      })
    );

    this.cancelOnDeactivate(
      this._isPressed.didChange.subscribe((isPressed) => {
        if (isPressed && this.props.onPress != null) {
          this.props.onPress();
        }
      }, true)
    );
  }
}
