"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Pointer = void 0;
const geometry_1 = require("@anderjason/geometry");
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const PendingClick_1 = require("./PendingClick");
class Pointer extends skytree_1.Actor {
    constructor() {
        super();
        this.points = observable_1.Observable.givenValue({});
        this.didClick = new observable_1.TypedEvent();
        this.didSingleClick = new observable_1.TypedEvent();
        this.didDoubleClick = new observable_1.TypedEvent();
        this.didStart = new observable_1.TypedEvent();
        this.didEnd = new observable_1.TypedEvent();
        this._hoveredElement = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.hoveredElement = observable_1.ReadOnlyObservable.givenObservable(this._hoveredElement);
        this._referenceCountByTarget = new Map();
        this.onKeyDown = (e) => {
            if (e.repeat) {
                return;
            }
            if (!e.altKey) {
                return;
            }
            if (e.key === "t") {
                this._keyboardTouchActive = true;
                this.startTouch("first", this._screenSpaceKeyboardTouchPoint);
            }
        };
        this.onKeyUp = (e) => {
            if (e.repeat) {
                return;
            }
            if (!this._keyboardTouchActive) {
                return;
            }
            if (e.key === "t") {
                this._keyboardTouchActive = false;
                this.endTouch("first", this._screenSpaceKeyboardTouchPoint);
            }
        };
        this.onPointerDown = (e) => {
            if (e.button !== 0) {
                return;
            }
            const screenPoint = geometry_1.Point2.givenXY(e.clientX, e.clientY);
            const isPrimary = e.isPrimary && !this._keyboardTouchActive;
            const namedTouchPoint = isPrimary ? "first" : "second";
            const isHandled = this.startTouch(namedTouchPoint, screenPoint);
            if (namedTouchPoint === "first") {
                this._pendingClick.pressButton(screenPoint);
            }
            if (isHandled) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        this.onPointerMove = (e) => {
            const screenPoint = geometry_1.Point2.givenXY(e.clientX, e.clientY);
            this._screenSpaceKeyboardTouchPoint = screenPoint;
            const isPrimary = e.isPrimary && !this._keyboardTouchActive;
            const namedTouchPoint = isPrimary ? "first" : "second";
            this.moveTouch(namedTouchPoint, screenPoint);
            if (namedTouchPoint === "first") {
                this._pendingClick.movePointer(screenPoint);
            }
        };
        this.onPointerUp = (e) => {
            if (e.button !== 0) {
                return;
            }
            const screenPoint = geometry_1.Point2.givenXY(e.clientX, e.clientY);
            const isPrimary = e.isPrimary && !this._keyboardTouchActive;
            const namedTouchPoint = isPrimary ? "first" : "second";
            const isHandled = this.endTouch(namedTouchPoint, screenPoint);
            if (namedTouchPoint === "first") {
                this._pendingClick.releaseButton(screenPoint);
            }
            if (isHandled) {
                e.preventDefault();
                e.stopPropagation();
            }
        };
        this.onPointerEnter = (e) => {
            if (e.buttons !== 0) {
                return;
            }
            this._pendingClick.reset();
            if (this._screenSpacePoint1 != null) {
                this.endTouch("first", this._screenSpacePoint1);
            }
            if (this._screenSpacePoint2 != null) {
                this.endTouch("second", this._screenSpacePoint2);
            }
        };
        this.updateTouchPosition = (namedTouchPoint, screenPoint) => {
            if (namedTouchPoint === "first") {
                this._screenSpacePoint1 = screenPoint;
            }
            else if (namedTouchPoint === "second") {
                this._screenSpacePoint2 = screenPoint;
            }
            this.notifyPointsChanged();
        };
    }
    static get instance() {
        if (Pointer._instance == null) {
            Pointer._instance = new Pointer();
            Pointer._instance.activate();
        }
        return this._instance;
    }
    onActivate() {
        // if (
        //   LocationUtil.currentHostIsLocal()
        // ) {
        //   this.addActor(
        //     new TouchVisualizer({
        //       touchSupport: this,
        //     })
        //   );
        // }
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this._referenceCountByTarget.clear();
        }));
        this._pendingClick = this.addActor(new PendingClick_1.PendingClick());
        this.cancelOnDeactivate(this._pendingClick.didClick.subscribe((screenPoint) => {
            this.onClick(screenPoint);
        }));
        this.cancelOnDeactivate(this._pendingClick.didSingleClick.subscribe((screenPoint) => {
            this.onSingleClick(screenPoint);
        }));
        this.cancelOnDeactivate(this._pendingClick.didDoubleClick.subscribe((screenPoint) => {
            this.onDoubleClick(screenPoint);
        }));
        if (typeof document !== "undefined") {
            document.body.addEventListener("keydown", this.onKeyDown);
            document.body.addEventListener("keyup", this.onKeyUp);
            document.body.addEventListener("pointerdown", this.onPointerDown);
            document.body.addEventListener("pointermove", this.onPointerMove);
            document.body.addEventListener("pointerup", this.onPointerUp);
            document.body.addEventListener("pointerenter", this.onPointerEnter);
            this.cancelOnDeactivate(new observable_1.Receipt(() => {
                document.body.removeEventListener("keydown", this.onKeyDown);
                document.body.removeEventListener("keyup", this.onKeyUp);
                document.body.removeEventListener("pointerdown", this.onPointerDown);
                document.body.removeEventListener("pointermove", this.onPointerMove);
                document.body.removeEventListener("pointerup", this.onPointerUp);
                document.body.removeEventListener("pointerenter", this.onPointerEnter);
            }));
        }
    }
    resetPendingClick() {
        this._pendingClick.reset();
    }
    addTarget(element) {
        const referenceCount = this._referenceCountByTarget.get(element) || 0;
        this._referenceCountByTarget.set(element, referenceCount + 1);
        return new observable_1.Receipt(() => {
            if (!this._referenceCountByTarget.has(element)) {
                return;
            }
            const newCount = this._referenceCountByTarget.get(element) - 1;
            if (newCount < 1) {
                this._referenceCountByTarget.delete(element);
            }
            else {
                this._referenceCountByTarget.set(element, newCount);
            }
        });
    }
    startTouch(namedTouchPoint, screenPoint) {
        const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
        // save this point for a possible keyboard-simulated touch event later
        this._screenSpaceKeyboardTouchPoint = screenPoint;
        this.updateTouchPosition(namedTouchPoint, screenPoint);
        const event = {
            screenPoint,
            target,
            namedTouchPoint,
            isHandled: false,
        };
        this.didStart.emit(event);
        return event.isHandled;
    }
    moveTouch(namedTouchPoint, screenPoint) {
        if (namedTouchPoint === "first" && this._screenSpacePoint1 == null) {
            return;
        }
        if (namedTouchPoint === "second" && this._screenSpacePoint2 == null) {
            return;
        }
        // save this point for a possible keyboard-simulated touch event later
        this._screenSpaceKeyboardTouchPoint = screenPoint;
        this.updateTouchPosition(namedTouchPoint, screenPoint);
    }
    endTouch(namedTouchPoint, screenPoint) {
        const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
        if (namedTouchPoint === "first") {
            this._screenSpacePoint1 = undefined;
            this._screenSpacePoint2 = undefined;
        }
        else {
            this._screenSpacePoint2 = undefined;
        }
        this.notifyPointsChanged();
        const event = {
            screenPoint,
            target,
            namedTouchPoint,
            isHandled: false,
        };
        this.didEnd.emit(event);
        return event.isHandled;
    }
    onClick(screenPoint) {
        const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
        this.didClick.emit({
            screenPoint,
            target,
            namedTouchPoint: "first",
            isHandled: false,
        });
    }
    onSingleClick(screenPoint) {
        const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
        this.didSingleClick.emit({
            screenPoint,
            target,
            namedTouchPoint: "first",
            isHandled: false,
        });
    }
    onDoubleClick(screenPoint) {
        const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
        this.didDoubleClick.emit({
            screenPoint,
            target,
            namedTouchPoint: "first",
            isHandled: false,
        });
    }
    optionalTargetElementGivenScreenPoint(screenPoint) {
        if (screenPoint == null) {
            return;
        }
        const elements = document.elementsFromPoint(screenPoint.x, screenPoint.y);
        const match = elements.find((el) => this._referenceCountByTarget.has(el));
        if (match == null) {
            return undefined;
        }
        return match;
    }
    notifyPointsChanged() {
        this.points.setValue({
            first: this._screenSpacePoint1,
            second: this._screenSpacePoint2,
        });
    }
}
exports.Pointer = Pointer;
//# sourceMappingURL=index.js.map