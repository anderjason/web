import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
export interface InternalScrollWatcherProps {
    element: HTMLElement;
    position: Observable<Point2>;
}
export interface ScrollWatcherProps {
    element?: HTMLElement | Observable<HTMLElement>;
}
export declare class ScrollWatcher extends Actor<ScrollWatcherProps> {
    private _position;
    readonly position: ReadOnlyObservable<Point2>;
    private _element;
    private _activeWatcher;
    constructor(props: ScrollWatcherProps);
    onActivate(): void;
}
