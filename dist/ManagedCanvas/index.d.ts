import { Size2 } from "@anderjason/geometry";
import { Actor } from "skytree";
import { Observable, ObservableBase } from "@anderjason/observable";
export interface ManagedCanvasProps {
    parentElement: Observable<HTMLElement>;
    size: ObservableBase<Size2>;
}
export declare class ManagedCanvas extends Actor<ManagedCanvasProps> {
    private _canvas;
    private _context;
    get context(): CanvasRenderingContext2D;
    get element(): HTMLCanvasElement;
    onActivate(): void;
}
