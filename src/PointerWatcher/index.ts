import { Point2 } from "@anderjason/geometry";
import {
  Observable,
  ReadOnlyObservable,
  Receipt,
  TypedEvent,
} from "@anderjason/observable";
import { ManagedObject } from "skytree";
import { PendingClick } from "./PendingClick";
import { TouchVisualizer } from "./TouchVisualizer";

export interface TouchPoints {
  first?: Point2;
  second?: Point2;
}

type NamedTouchPoint = "first" | "second";

export interface TouchSupportEvent {
  screenPoint: Point2;
  isHandled: boolean;
  namedTouchPoint: NamedTouchPoint;

  target?: Element;
}

export class PointerWatcher extends ManagedObject<void> {
  private static _instance: PointerWatcher;

  static get instance(): PointerWatcher {
    if (PointerWatcher._instance == null) {
      PointerWatcher._instance = new PointerWatcher();
      PointerWatcher._instance.activate();
    }

    return this._instance;
  }

  readonly points = Observable.givenValue<TouchPoints>({});

  readonly didClick = new TypedEvent<TouchSupportEvent>();
  readonly didSingleClick = new TypedEvent<TouchSupportEvent>();
  readonly didDoubleClick = new TypedEvent<TouchSupportEvent>();
  readonly didStart = new TypedEvent<TouchSupportEvent>();
  readonly didEnd = new TypedEvent<TouchSupportEvent>();

  private _hoveredElement = Observable.ofEmpty<Element>(
    Observable.isStrictEqual
  );
  readonly hoveredElement = ReadOnlyObservable.givenObservable(
    this._hoveredElement
  );

  private _referenceCountByTarget = new Map<Element, number>();

  private _screenSpacePoint1: Point2;
  private _screenSpacePoint2: Point2;
  private _screenSpaceKeyboardTouchPoint: Point2;
  private _keyboardTouchActive: boolean;
  private _pendingClick: PendingClick;

  private constructor() {
    super();
  }

  onActivate() {
    if (
      window.location.hostname === "localhost" ||
      window.location.hostname === "192.168.1.100"
    ) {
      this.addManagedObject(
        new TouchVisualizer({
          touchSupport: this,
        })
      );
    }

    this.cancelOnDeactivate(
      new Receipt(() => {
        this._referenceCountByTarget.clear();
      })
    );

    this._pendingClick = this.addManagedObject(new PendingClick());

    this.cancelOnDeactivate(
      this._pendingClick.didClick.subscribe((screenPoint) => {
        this.onClick(screenPoint);
      })
    );

    this.cancelOnDeactivate(
      this._pendingClick.didSingleClick.subscribe((screenPoint) => {
        this.onSingleClick(screenPoint);
      })
    );

    this.cancelOnDeactivate(
      this._pendingClick.didDoubleClick.subscribe((screenPoint) => {
        this.onDoubleClick(screenPoint);
      })
    );

    if (typeof document !== "undefined") {
      document.body.addEventListener("keydown", this.onKeyDown);
      document.body.addEventListener("keyup", this.onKeyUp);

      document.body.addEventListener("pointerdown", this.onPointerDown);
      document.body.addEventListener("pointermove", this.onPointerMove);
      document.body.addEventListener("pointerup", this.onPointerUp);
      document.body.addEventListener("pointerenter", this.onPointerEnter);

      this.cancelOnDeactivate(
        new Receipt(() => {
          document.body.removeEventListener("keydown", this.onKeyDown);
          document.body.removeEventListener("keyup", this.onKeyUp);

          document.body.removeEventListener("pointerdown", this.onPointerDown);
          document.body.removeEventListener("pointermove", this.onPointerMove);
          document.body.removeEventListener("pointerup", this.onPointerUp);
          document.body.removeEventListener(
            "pointerenter",
            this.onPointerEnter
          );
        })
      );
    }
  }

  resetPendingClick(): void {
    this._pendingClick.reset();
  }

  addTarget(element: Element): Receipt {
    const referenceCount: number =
      this._referenceCountByTarget.get(element) || 0;
    this._referenceCountByTarget.set(element, referenceCount + 1);

    return new Receipt(() => {
      if (!this._referenceCountByTarget.has(element)) {
        return;
      }

      const newCount = this._referenceCountByTarget.get(element) - 1;
      if (newCount < 1) {
        this._referenceCountByTarget.delete(element);
      } else {
        this._referenceCountByTarget.set(element, newCount);
      }
    });
  }

  private onKeyDown = (e: KeyboardEvent): void => {
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

  private onKeyUp = (e: KeyboardEvent): void => {
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

  private startTouch(
    namedTouchPoint: NamedTouchPoint,
    screenPoint: Point2
  ): boolean {
    const target = this.optionalTargetElementGivenScreenPoint(screenPoint);
    // save this point for a possible keyboard-simulated touch event later
    this._screenSpaceKeyboardTouchPoint = screenPoint;

    this.updateTouchPosition(namedTouchPoint, screenPoint);

    const event: TouchSupportEvent = {
      screenPoint,
      target,
      namedTouchPoint,
      isHandled: false,
    };

    this.didStart.emit(event);

    return event.isHandled;
  }

  private moveTouch(
    namedTouchPoint: NamedTouchPoint,
    screenPoint: Point2
  ): void {
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

  private endTouch(
    namedTouchPoint: NamedTouchPoint,
    screenPoint: Point2
  ): boolean {
    const target = this.optionalTargetElementGivenScreenPoint(screenPoint);

    if (namedTouchPoint === "first") {
      this._screenSpacePoint1 = undefined;
      this._screenSpacePoint2 = undefined;
    } else {
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

  private onPointerDown = (e: PointerEvent): void => {
    if (e.button !== 0) {
      return;
    }

    const screenPoint = Point2.givenXY(e.clientX, e.clientY);
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

  private onPointerMove = (e: PointerEvent): void => {
    const screenPoint = Point2.givenXY(e.clientX, e.clientY);
    this._screenSpaceKeyboardTouchPoint = screenPoint;

    const isPrimary = e.isPrimary && !this._keyboardTouchActive;
    const namedTouchPoint = isPrimary ? "first" : "second";

    this.moveTouch(namedTouchPoint, screenPoint);

    if (namedTouchPoint === "first") {
      this._pendingClick.movePointer(screenPoint);
    }
  };

  private onPointerUp = (e: PointerEvent): void => {
    if (e.button !== 0) {
      return;
    }

    const screenPoint = Point2.givenXY(e.clientX, e.clientY);
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

  private onPointerEnter = (e: PointerEvent): void => {
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

  private onClick(screenPoint: Point2): void {
    const target = this.optionalTargetElementGivenScreenPoint(screenPoint);

    this.didClick.emit({
      screenPoint,
      target,
      namedTouchPoint: "first",
      isHandled: false,
    });
  }

  private onSingleClick(screenPoint: Point2): void {
    const target = this.optionalTargetElementGivenScreenPoint(screenPoint);

    this.didSingleClick.emit({
      screenPoint,
      target,
      namedTouchPoint: "first",
      isHandled: false,
    });
  }

  private onDoubleClick(screenPoint: Point2): void {
    const target = this.optionalTargetElementGivenScreenPoint(screenPoint);

    this.didDoubleClick.emit({
      screenPoint,
      target,
      namedTouchPoint: "first",
      isHandled: false,
    });
  }

  private updateTouchPosition = (
    namedTouchPoint: NamedTouchPoint,
    screenPoint: Point2
  ): void => {
    if (namedTouchPoint === "first") {
      this._screenSpacePoint1 = screenPoint;
    } else if (namedTouchPoint === "second") {
      this._screenSpacePoint2 = screenPoint;
    }

    this.notifyPointsChanged();
  };

  private optionalTargetElementGivenScreenPoint(
    screenPoint: Point2
  ): Element | undefined {
    if (screenPoint == null) {
      return;
    }

    const elements = document.elementsFromPoint(screenPoint.x, screenPoint.y);
    const match = elements.find((el) => this._referenceCountByTarget.has(el));

    if (match == null) {
      return undefined;
    }

    return match as Element;
  }

  private notifyPointsChanged(): void {
    this.points.setValue({
      first: this._screenSpacePoint1,
      second: this._screenSpacePoint2,
    });
  }
}
