import { Actor } from "skytree";
import { TypedEvent } from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
export declare class PendingClick extends Actor<void> {
    readonly didClick: TypedEvent<Point2>;
    readonly didSingleClick: TypedEvent<Point2>;
    readonly didDoubleClick: TypedEvent<Point2>;
    private _targetPoint;
    private _state;
    private _evaluateLongPressLater;
    constructor();
    onActivate(): void;
    pressButton(newPoint: Point2): void;
    movePointer(newPoint: Point2): void;
    releaseButton(newPoint: Point2): void;
    private evaluateLongPress;
    reset(): void;
    private notifyClick;
    private notifySingleClick;
    private notifyDoubleClick;
}
