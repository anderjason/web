import { Size2 } from "@anderjason/geometry";
import { Actor } from "skytree";
import { Observable, ObservableBase, ReadOnlyObservable, Receipt } from "@anderjason/observable";
export interface ManagedCanvasProps {
    parentElement: Observable<HTMLElement>;
    size: ObservableBase<Size2>;
    renderEveryFrame?: boolean | Observable<boolean>;
}
export declare type ManagedCanvasRenderFunction = (context: CanvasRenderingContext2D, pixelSize: Size2, displaySize: Size2) => void;
export declare class ManagedCanvas extends Actor<ManagedCanvasProps> {
    private _canvas;
    get context(): CanvasRenderingContext2D;
    get element(): HTMLCanvasElement;
    private _pixelSize;
    private _renderers;
    readonly displaySize: ReadOnlyObservable<Size2>;
    readonly pixelSize: ReadOnlyObservable<Size2>;
    constructor(props: ManagedCanvasProps);
    addRenderer(fn: ManagedCanvasRenderFunction, timing: number): Receipt;
    onActivate(): void;
    render(): void;
}
