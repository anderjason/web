import { Size2 } from "@anderjason/geometry";
import { Actor } from "skytree";
import { ManagedElement } from "../ManagedElement";
import { Observable, ObservableBase, ReadOnlyObservable, Receipt } from "@anderjason/observable";
export interface ManagedCanvasProps {
    parentElement: HTMLElement | ObservableBase<HTMLElement>;
    displaySize: Size2 | ObservableBase<Size2>;
    renderEveryFrame: boolean | Observable<boolean>;
    keepPreviousRenders?: boolean | Observable<boolean>;
    className?: string;
}
export interface ManagedCanvasRenderParams {
    context: CanvasRenderingContext2D;
    pixelSize: Size2;
    displaySize: Size2;
    devicePixelRatio: number;
}
export declare type ManagedCanvasRenderFunction = (params: ManagedCanvasRenderParams) => void;
export declare class ManagedCanvas extends Actor<ManagedCanvasProps> {
    private _canvas;
    get context(): CanvasRenderingContext2D;
    get managedElement(): ManagedElement<HTMLCanvasElement>;
    get element(): HTMLCanvasElement;
    private _pixelSize;
    private _renderers;
    private _needsRender;
    private _keepPreviousRenders;
    private _parentElement;
    private _displaySize;
    readonly displaySize: ReadOnlyObservable<Size2>;
    readonly pixelSize: ReadOnlyObservable<Size2>;
    constructor(props: ManagedCanvasProps);
    addRenderer(renderOrder: number, render: ManagedCanvasRenderFunction): Receipt;
    onActivate(): void;
    needsRender(): void;
    private render;
}
