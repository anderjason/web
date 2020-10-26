import { Actor } from "skytree";
import { ReadOnlyObservableSet } from "@anderjason/observable";
export declare class KeyboardWatcher extends Actor<void> {
    private static _instance;
    static controlKey: string;
    static altKey: string;
    static shiftKey: string;
    static get instance(): KeyboardWatcher;
    private _keys;
    readonly keys: ReadOnlyObservableSet<string>;
    private constructor();
    onActivate(): void;
    private onKeyDown;
    private onKeyUp;
}
