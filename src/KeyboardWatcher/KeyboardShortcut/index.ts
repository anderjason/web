import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ManagedObject } from "skytree";
import { KeyboardWatcher } from "..";

export type KeyCombination = string[];

export interface KeyboardShortcutProps {
  keyCombinations: KeyCombination[];
  onPress: () => void;
}

export class KeyboardShortcut extends ManagedObject<KeyboardShortcutProps> {
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

  private _activeKeyCombination: KeyCombination;

  constructor(props: KeyboardShortcutProps) {
    super(props);

    // any key with a single character should be lowercase
  }

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

    this.cancelOnDeactivate(
      KeyboardWatcher.instance.keys.didChange.subscribe(() => {
        this._activeKeyCombination = keyCombinations.find((keyCombination) => {
          return keyCombination.every((key) => {
            return KeyboardWatcher.instance.keys.hasValue(key);
          });
        });

        this._isPressed.setValue(this._activeKeyCombination != null);
      }, true)
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
