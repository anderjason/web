import { ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
export interface ElementMountWatcherProps {
    element: HTMLElement;
}
export declare class ElementMountWatcher extends Actor<ElementMountWatcherProps> {
    private static watcherByElement;
    private static _isWatching;
    private static watchAllOnce;
    private _isElementMounted;
    readonly isElementMounted: ReadOnlyObservable<boolean>;
    onActivate(): void;
}
