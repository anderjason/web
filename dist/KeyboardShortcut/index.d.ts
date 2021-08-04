import { ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
import { KeyboardKey } from "../KeyboardWatcher";
export declare type KeyCombination = KeyboardKey[];
export interface KeyboardShortcutProps {
    keyCombination: KeyCombination;
    onPress?: () => void;
}
export declare class KeyboardShortcut extends Actor<KeyboardShortcutProps> {
    private static shortcutsByKeyCombination;
    private static getShortcutsArray;
    private _isPressed;
    readonly isPressed: ReadOnlyObservable<boolean>;
    onActivate(): void;
}
