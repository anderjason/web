import {
  Observable,
  ObservableArray,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Actor } from "skytree";
import { KeyboardWatcher } from "../KeyboardWatcher";

export type KeyCombination = string[];

export interface KeyboardShortcutProps {
  keyCombinations: KeyCombination[];
  onPress: () => void;
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

  static givenKey(key: string, onPress: () => void): KeyboardShortcut {
    const keyCombination: KeyCombination = [key];
    return KeyboardShortcut.givenKeyCombination(keyCombination, onPress);
  }

  static givenKeyCombination(
    keyCombination: KeyCombination,
    onPress: () => void
  ): KeyboardShortcut {
    return new KeyboardShortcut({
      keyCombinations: [keyCombination],
      onPress,
    });
  }

  static givenAnyKeyCombination(
    keyCombinations: KeyCombination[],
    onPress: () => void
  ): KeyboardShortcut {
    return new KeyboardShortcut({ keyCombinations, onPress });
  }

  private _isPressed = Observable.ofEmpty<boolean>(Observable.isStrictEqual);
  readonly isPressed = ReadOnlyObservable.givenObservable(this._isPressed);

  onActivate() {
    const keyCombinations = this.props.keyCombinations.map((keyCombination) => {
      return keyCombination.map((key) => {
        if (key.length === 1) {
          return key.toLowerCase();
        } else {
          return key;
        }
      });
    });

    keyCombinations.forEach((combination) => {
      KeyboardShortcut.getShortcutsArray(combination).addValue(this);
    });

    this.cancelOnDeactivate(
      new Receipt(() => {
        keyCombinations.forEach((combination) => {
          KeyboardShortcut.getShortcutsArray(combination).removeValue(this);
        });
      })
    );

    this.cancelOnDeactivate(
      KeyboardWatcher.instance.keys.didChange.subscribe(() => {
        const activeKeyCombination = keyCombinations.find((keyCombination) => {
          return keyCombination.every((key) => {
            return KeyboardWatcher.instance.keys.hasValue(key);
          });
        });

        if (activeKeyCombination == null) {
          this._isPressed.setValue(false);
          return;
        }

        const shortcuts = KeyboardShortcut.getShortcutsArray(
          activeKeyCombination
        );

        if (shortcuts.toOptionalValueGivenIndex(shortcuts.count - 1) == this) {
          this._isPressed.setValue(activeKeyCombination != null);
        } else {
          this._isPressed.setValue(false);
        }
      })
    );

    this.cancelOnDeactivate(
      this._isPressed.didChange.subscribe((isPressed) => {
        if (isPressed) {
          this.props.onPress();
        }
      }, true)
    );
  }
}
