import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ManagedObject } from "skytree";
export interface FocusWatcherProps {
    element: HTMLInputElement | HTMLTextAreaElement;
    output?: Observable<boolean>;
}
export declare class FocusWatcher extends ManagedObject<FocusWatcherProps> {
    private _output;
    readonly output: ReadOnlyObservable<boolean>;
    constructor(props: FocusWatcherProps);
    onActivate(): void;
}
