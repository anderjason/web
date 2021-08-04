import { Actor } from "skytree";
import { ReadOnlyObservableSet } from "@anderjason/observable";
export declare type KeyboardKey = "A" | "B" | "C" | "D" | "E" | "F" | "G" | "H" | "I" | "J" | "K" | "L" | "M" | "N" | "O" | "P" | "Q" | "R" | "S" | "T" | "U" | "V" | "W" | "X" | "Y" | "Z" | "1" | "2" | "3" | "4" | "5" | "6" | "7" | "8" | "9" | "0" | "F1" | "F2" | "F3" | "F4" | "F5" | "F6" | "F7" | "F8" | "F9" | "F10" | "F11" | "F12" | "Left" | "Right" | "Up" | "Down" | "Period" | "Comma" | "Semicolon" | "Quote" | "BracketLeft" | "BracketRight" | "Slash" | "Backslash" | "Backquote" | "Tab" | "Minus" | "Equal" | "Escape" | "Enter" | "Space" | "Delete" | "Shift" | "Alt" | "Control";
export declare class KeyboardWatcher extends Actor<void> {
    private static _instance;
    static controlKey: KeyboardKey;
    static altKey: KeyboardKey;
    static shiftKey: KeyboardKey;
    static get instance(): KeyboardWatcher;
    private _keys;
    readonly keys: ReadOnlyObservableSet<KeyboardKey>;
    private constructor();
    onActivate(): void;
    private onKeyDown;
    private onKeyUp;
}
