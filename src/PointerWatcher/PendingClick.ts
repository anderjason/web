import { ManagedObject } from "skytree";
import { TypedEvent, Receipt } from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
import { Debounce, Duration } from "@anderjason/time";

function pointIsNearPoint(
  a: Point2,
  b: Point2,
  threshold: number = 4
): boolean {
  if (a == null || b == null) {
    return false;
  }

  const distance = a.toDistance(b);
  return distance < threshold;
}

type PendingClickState = "idle" | "down" | "click" | "down2";

export class PendingClick extends ManagedObject<void> {
  readonly didClick = new TypedEvent<Point2>();
  readonly didSingleClick = new TypedEvent<Point2>();
  readonly didDoubleClick = new TypedEvent<Point2>();

  private _targetPoint: Point2;
  private _state: PendingClickState;
  private _evaluateLongPressLater: Debounce;

  constructor() {
    super();

    this._evaluateLongPressLater = new Debounce({
      duration: Duration.givenSeconds(0.5),
      fn: async () => {
        this.evaluateLongPress();
      },
    });
  }

  onActivate() {
    this.cancelOnDeactivate(
      new Receipt(() => {
        this._evaluateLongPressLater.clear();
      })
    );
  }

  pressButton(newPoint: Point2): void {
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

  movePointer(newPoint: Point2): void {
    if (!pointIsNearPoint(newPoint, this._targetPoint)) {
      this.reset();
    }
  }

  releaseButton(newPoint: Point2): void {
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

  private evaluateLongPress() {
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

  private notifyClick() {
    const screenPoint = this._targetPoint;

    this.didClick.emit(screenPoint);
  }

  private notifySingleClick() {
    const screenPoint = this._targetPoint;

    this.reset();

    this.didSingleClick.emit(screenPoint);
  }

  private notifyDoubleClick() {
    const screenPoint = this._targetPoint;

    this.reset();

    this.didDoubleClick.emit(screenPoint);
  }
}
