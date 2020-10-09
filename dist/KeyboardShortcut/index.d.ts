import { ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
export declare type KeyCombination = string[];
export interface KeyboardShortcutProps {
    keyCombinations: KeyCombination[];
    onPress: () => void;
}
export declare class KeyboardShortcut extends Actor<KeyboardShortcutProps> {
    private static shortcutsByKeyCombination;
    private static getShortcutsArray;
    static givenKey(key: string, onPress: () => void): KeyboardShortcut;
    static givenKeyCombination(keyCombination: KeyCombination, onPress: () => void): KeyboardShortcut;
    static givenAnyKeyCombination(keyCombinations: KeyCombination[], onPress: () => void): KeyboardShortcut;
    private _isPressed;
    readonly isPressed: ReadOnlyObservable<boolean>;
    onActivate(): void;
}
