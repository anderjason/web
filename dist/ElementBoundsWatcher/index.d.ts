import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Box2 } from "@anderjason/geometry";
export interface InternalElementBoundsWatcherProps {
    element: HTMLElement;
    output: Observable<Box2>;
}
export interface ElementBoundsWatcherProps {
    element: HTMLElement | Observable<HTMLElement>;
    output?: Observable<Box2>;
}
export declare class ElementBoundsWatcher extends Actor<ElementBoundsWatcherProps> {
    private _output;
    readonly output: ReadOnlyObservable<Box2>;
    private _element;
    private _activeWatcher;
    constructor(props: ElementBoundsWatcherProps);
    onActivate(): void;
}
