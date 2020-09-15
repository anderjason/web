import { ReadOnlyObservable } from "@anderjason/observable";
import { ManagedObject } from "skytree";
export declare type KeyCombination = string[];
export interface KeyboardShortcutProps {
    keyCombinations: KeyCombination[];
    onPress: () => void;
}
export declare class KeyboardShortcut extends ManagedObject<KeyboardShortcutProps> {
    static givenKey(key: string, onPress: () => void): KeyboardShortcut;
    static givenKeyCombination(keyCombination: KeyCombination, onPress: () => void): KeyboardShortcut;
    static givenAnyKeyCombination(keyCombinations: KeyCombination[], onPress: () => void): KeyboardShortcut;
    private _isPressed;
    readonly isPressed: ReadOnlyObservable<boolean>;
    private _activeKeyCombination;
    constructor(props: KeyboardShortcutProps);
    onActivate(): void;
}
