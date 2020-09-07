import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
export declare class ScrollWatcher extends ManagedObject {
    static ofEmpty(): ScrollWatcher;
    static givenElement(element: HTMLElement): ScrollWatcher;
    static givenObservableElement(element: Observable<HTMLElement>): ScrollWatcher;
    readonly position: Observable<Point2>;
    readonly element: Observable<HTMLElement>;
    private _activeWatcher;
    private constructor();
    initManagedObject(): void;
}
