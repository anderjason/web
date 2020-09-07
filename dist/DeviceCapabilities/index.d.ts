import { ReadOnlyObservable } from "@anderjason/observable";
import { Size2 } from "@anderjason/geometry";
export declare class DeviceCapabilities {
    private static _instance;
    static get instance(): DeviceCapabilities;
    private _measureScrollbarLater;
    private _availableSize;
    readonly availableSize: ReadOnlyObservable<Size2>;
    private _scrollbarSize;
    readonly scrollbarSize: ReadOnlyObservable<Size2>;
    private constructor();
    private measureScrollbar;
    private recalculateSize;
}
