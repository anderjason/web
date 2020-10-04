"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PendingClick = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const time_1 = require("@anderjason/time");
function pointIsNearPoint(a, b, threshold = 4) {
    if (a == null || b == null) {
        return false;
    }
    const distance = a.toDistance(b);
    return distance < threshold;
}
class PendingClick extends skytree_1.Actor {
    constructor() {
        super();
        this.didClick = new observable_1.TypedEvent();
        this.didSingleClick = new observable_1.TypedEvent();
        this.didDoubleClick = new observable_1.TypedEvent();
        this._evaluateLongPressLater = new time_1.Debounce({
            duration: time_1.Duration.givenSeconds(0.5),
            fn: async () => {
                this.evaluateLongPress();
            },
        });
    }
    onActivate() {
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this._evaluateLongPressLater.clear();
        }));
    }
    pressButton(newPoint) {
        if (this.isActive.value == false) {
            return;
        }
        if (!pointIsNearPoint(newPoint, this._targetPoint)) {
            this.reset();
        }
        switch (this._state) {
            case "idle":
                this._targetPoint = newPoint;
                this._state = "down";
                this._evaluateLongPressLater.invoke();
                break;
            case "click":
                this._state = "down2";
                break;
            default:
                break;
        }
    }
    movePointer(newPoint) {
        if (!pointIsNearPoint(newPoint, this._targetPoint)) {
            this.reset();
        }
    }
    releaseButton(newPoint) {
        if (this.isActive.value == false) {
            return;
        }
        if (!pointIsNearPoint(newPoint, this._targetPoint)) {
            this.reset();
        }
        switch (this._state) {
            case "down":
                this._state = "click";
                this.notifyClick();
                break;
            case "down2":
                this.notifyDoubleClick();
                break;
            case "idle":
            default:
                break;
        }
    }
    evaluateLongPress() {
        switch (this._state) {
            case "down":
                this.notifyClick();
                requestAnimationFrame(() => {
                    this.notifyDoubleClick();
                });
                break;
            case "down2":
                this.notifyDoubleClick();
                break;
            case "click":
                this.notifySingleClick();
                break;
            default:
                this.reset();
                break;
        }
    }
    reset() {
        this._targetPoint = undefined;
        this._state = "idle";
        this._evaluateLongPressLater.clear();
    }
    notifyClick() {
        const screenPoint = this._targetPoint;
        this.didClick.emit(screenPoint);
    }
    notifySingleClick() {
        const screenPoint = this._targetPoint;
        this.reset();
        this.didSingleClick.emit(screenPoint);
    }
    notifyDoubleClick() {
        const screenPoint = this._targetPoint;
        this.reset();
        this.didDoubleClick.emit(screenPoint);
    }
}
exports.PendingClick = PendingClick;
//# sourceMappingURL=PendingClick.js.map