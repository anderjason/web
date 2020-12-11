import { Box2, Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase } from "@anderjason/observable";
import { Actor } from "skytree";
import { ManagedElement } from "../..";
export interface DragVerticalProps {
    canvas: ManagedElement<HTMLCanvasElement>;
    trackSize: ObservableBase<Size2>;
    thumb: Observable<Box2>;
    scrollElement: HTMLElement;
}
export declare class DragVertical extends Actor<DragVerticalProps> {
    onActivate(): void;
}
