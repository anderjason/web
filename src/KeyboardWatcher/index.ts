import { Actor } from "skytree";
import {
  ObservableSet,
  ReadOnlyObservableSet,
  Receipt,
} from "@anderjason/observable";

export type KeyboardKey =
  | "A"
  | "B"
  | "C"
  | "D"
  | "E"
  | "F"
  | "G"
  | "H"
  | "I"
  | "J"
  | "K"
  | "L"
  | "M"
  | "N"
  | "O"
  | "P"
  | "Q"
  | "R"
  | "S"
  | "T"
  | "U"
  | "V"
  | "W"
  | "X"
  | "Y"
  | "Z"
  | "1"
  | "2"
  | "3"
  | "4"
  | "5"
  | "6"
  | "7"
  | "8"
  | "9"
  | "0"
  | "F1"
  | "F2"
  | "F3"
  | "F4"
  | "F5"
  | "F6"
  | "F7"
  | "F8"
  | "F9"
  | "F10"
  | "F11"
  | "F12"
  | "Left"
  | "Right"
  | "Up"
  | "Down"
  | "Period"
  | "Comma"
  | "Semicolon"
  | "Quote"
  | "BracketLeft"
  | "BracketRight"
  | "Slash"
  | "Backslash"
  | "Backquote"
  | "Tab"
  | "Minus"
  | "Equal"
  | "Escape"
  | "Enter"
  | "Space"
  | "Delete"
  | "Shift"
  | "Alt"
  | "Control";

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

function keyboardKeyGivenKeyboardEventCode(code: string): KeyboardKey | undefined {
  let match = /^Key([A-Z])$/.exec(code);
  if (match != null) {
    // like KeyW -> W
    return match[1] as KeyboardKey;
  }

  match = /^Digit([0-9])$/.exec(code);
  if (match != null) {
    // like Digit2 -> 2
    return match[1] as KeyboardKey;
  }

  match = /^(Shift|Alt|Control)(Left|Right)$/.exec(code);
  if (match != null) {
    // like ControlLeft -> Control
    return match[1] as KeyboardKey;
  }

  match = /^Arrow(Left|Right|Up|Down)$/.exec(code);
  if (match != null) {
    // like ArrowDown -> Down
    return match[1] as KeyboardKey;
  }

  if (exactMatches.has(code)) {
    return code as KeyboardKey;
  }

  if (code === "Backspace") {
    return "Delete";
  }

  // console.log(`Unsupported key code '${code}'`);
  return undefined;
}

export class KeyboardWatcher extends Actor<void> {
  private static _instance: KeyboardWatcher;

  static controlKey: KeyboardKey = "Control";
  static altKey: KeyboardKey = "Alt";
  static shiftKey: KeyboardKey = "Shift";

  static get instance(): KeyboardWatcher {
    if (KeyboardWatcher._instance == null) {
      KeyboardWatcher._instance = new KeyboardWatcher();
      KeyboardWatcher._instance.activate();
    }

    return this._instance;
  }

  private _keys = ObservableSet.ofEmpty<KeyboardKey>();
  readonly keys = ReadOnlyObservableSet.givenObservableSet(this._keys);

  private constructor() {
    super();
  }

  onActivate() {
    if (typeof window === "undefined") {
      return;
    }

    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.cancelOnDeactivate(
      new Receipt(() => {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
      })
    );
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat == true) {
      return;
    }

    const keyboardKey = keyboardKeyGivenKeyboardEventCode(e.code);
    this._keys.addValue(keyboardKey);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    const keyboardKey = keyboardKeyGivenKeyboardEventCode(e.code);
    this._keys.removeValue(keyboardKey);
  };
}
