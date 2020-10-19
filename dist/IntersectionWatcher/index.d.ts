import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Percent } from "@anderjason/util";
import { Actor } from "skytree";
export interface InternalIntersectionWatcherProps {
    element: HTMLElement;
    minimumVisiblePercent: Percent;
    isElementVisible: Observable<boolean>;
    scrollElement?: HTMLElement;
    rootMargin?: string;
}
export interface IntersectionWatcherProps {
    element: HTMLElement | Observable<HTMLElement>;
    minimumVisiblePercent: Percent;
    scrollElement?: HTMLElement;
    rootMargin?: string;
    isElementVisible?: Observable<boolean>;
}
export declare class IntersectionWatcher extends Actor<IntersectionWatcherProps> {
    private _isElementVisible;
    readonly isElementVisible: ReadOnlyObservable<boolean>;
    private _element;
    private _activeWatcher;
    constructor(props: IntersectionWatcherProps);
    onActivate(): void;
}
