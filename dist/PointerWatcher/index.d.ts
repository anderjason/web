import { Point2 } from "@anderjason/geometry";
import { Observable, ReadOnlyObservable, Receipt, TypedEvent } from "@anderjason/observable";
import { ManagedObject } from "skytree";
export interface TouchPoints {
    first?: Point2;
    second?: Point2;
}
declare type NamedTouchPoint = "first" | "second";
export interface TouchSupportEvent {
    screenPoint: Point2;
    isHandled: boolean;
    namedTouchPoint: NamedTouchPoint;
    target?: Element;
}
export declare class PointerWatcher extends ManagedObject<void> {
    private static _instance;
    static get instance(): PointerWatcher;
    readonly points: Observable<TouchPoints>;
    readonly didClick: TypedEvent<TouchSupportEvent>;
    readonly didSingleClick: TypedEvent<TouchSupportEvent>;
    readonly didDoubleClick: TypedEvent<TouchSupportEvent>;
    readonly didStart: TypedEvent<TouchSupportEvent>;
    readonly didEnd: TypedEvent<TouchSupportEvent>;
    private _hoveredElement;
    readonly hoveredElement: ReadOnlyObservable<Element>;
    private _referenceCountByTarget;
    private _screenSpacePoint1;
    private _screenSpacePoint2;
    private _screenSpaceKeyboardTouchPoint;
    private _keyboardTouchActive;
    private _pendingClick;
    private constructor();
    onActivate(): void;
    resetPendingClick(): void;
    addTarget(element: Element): Receipt;
    private onKeyDown;
    private onKeyUp;
    private startTouch;
    private moveTouch;
    private endTouch;
    private onPointerDown;
    private onPointerMove;
    private onPointerUp;
    private onPointerEnter;
    private onClick;
    private onSingleClick;
    private onDoubleClick;
    private updateTouchPosition;
    private optionalTargetElementGivenScreenPoint;
    private notifyPointsChanged;
}
export {};
