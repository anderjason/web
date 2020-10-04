import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
export interface FocusWatcherProps {
    element: HTMLInputElement | HTMLTextAreaElement;
    output?: Observable<boolean>;
}
export declare class FocusWatcher extends Actor<FocusWatcherProps> {
    private _output;
    readonly output: ReadOnlyObservable<boolean>;
    constructor(props: FocusWatcherProps);
    onActivate(): void;
}
