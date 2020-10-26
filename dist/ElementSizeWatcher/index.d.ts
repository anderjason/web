import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Size2 } from "@anderjason/geometry";
export interface InternalElementSizeWatcherProps {
    element: HTMLElement;
    output: Observable<Size2>;
}
export interface ElementSizeWatcherProps {
    element: HTMLElement | Observable<HTMLElement>;
    output?: Observable<Size2>;
}
export declare class ElementSizeWatcher extends Actor<ElementSizeWatcherProps> {
    private _output;
    readonly output: ReadOnlyObservable<Size2>;
    private _element;
    private _activeWatcher;
    constructor(props: ElementSizeWatcherProps);
    onActivate(): void;
}
