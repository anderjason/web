import { Size2 } from "@anderjason/geometry";
import { Actor } from "skytree";
import { Observable, ObservableArray, ObservableBase, ReadOnlyObservable } from "@anderjason/observable";
export interface ManagedCanvasProps {
    parentElement: Observable<HTMLElement>;
    size: ObservableBase<Size2>;
    renderEveryFrame?: boolean | Observable<boolean>;
}
export declare type ManagedCanvasRenderer = (context: CanvasRenderingContext2D, pixelSize: Size2) => void;
export declare class ManagedCanvas extends Actor<ManagedCanvasProps> {
    private _canvas;
    get context(): CanvasRenderingContext2D;
    get element(): HTMLCanvasElement;
    private _pixelSize;
    readonly displaySize: ReadOnlyObservable<Size2>;
    readonly pixelSize: ReadOnlyObservable<Size2>;
    readonly renderers: ObservableArray<ManagedCanvasRenderer>;
    constructor(props: ManagedCanvasProps);
    onActivate(): void;
    render(): void;
}
