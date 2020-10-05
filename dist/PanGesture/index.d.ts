import { Vector2 } from "@anderjason/geometry/dist/Vector2";
import { Actor } from "skytree";
export declare type PanGestureHandler = (delta: Vector2) => void;
export interface PanGestureProps {
    onPan: PanGestureHandler;
}
export declare class PanGesture extends Actor<PanGestureProps> {
    onActivate(): void;
}
