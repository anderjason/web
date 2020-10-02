import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Size2 } from "@anderjason/geometry";
import { ManagedObject } from "skytree";
export declare class ScreenSize extends ManagedObject<void> {
    private static _instance;
    static get instance(): ScreenSize;
    private _measureScrollbarLater;
    private _availableSize;
    readonly availableSize: ReadOnlyObservable<Size2>;
    private _scrollbarSize;
    readonly scrollbarSize: ReadOnlyObservable<Size2>;
    readonly isPollingEnabled: Observable<boolean>;
    private constructor();
    private measureScrollbar;
    recalculateSize(): void;
}
