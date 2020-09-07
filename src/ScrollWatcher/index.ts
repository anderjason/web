import { ManagedObject } from "skytree";
import { Observable, Receipt } from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
import { MutablePoint2 } from "@anderjason/geometry";

class ActiveScrollWatcher extends ManagedObject {
  private _element: HTMLElement;
  private _position: Observable<Point2>;

  constructor(element: HTMLElement, position: Observable<Point2>) {
    super();

    this._element = element;
    this._position = position;
  }

  initManagedObject() {
    const mutablePoint = MutablePoint2.ofZero();

    const onScroll = () => {
      mutablePoint.x = this._element.scrollLeft;
      mutablePoint.y = this._element.scrollTop;

      if (this._position.value == null) {
        this._position.setValue(mutablePoint);
      } else {
        this._position.didChange.emit(mutablePoint);
      }
    };

    this._element.addEventListener("scroll", onScroll);
    onScroll();

    this.addReceipt(
      Receipt.givenCancelFunction(() => {
        this._element.removeEventListener("scroll", onScroll);
        this._position.setValue(undefined);
      })
    );
  }
}

export class ScrollWatcher extends ManagedObject {
  static ofEmpty(): ScrollWatcher {
    return new ScrollWatcher(Observable.ofEmpty<HTMLElement>());
  }

  static givenElement(element: HTMLElement): ScrollWatcher {
    return new ScrollWatcher(Observable.givenValue(element));
  }

  static givenObservableElement(
    element: Observable<HTMLElement>
  ): ScrollWatcher {
    return new ScrollWatcher(element);
  }

  readonly position = Observable.ofEmpty<Point2>(Point2.isEqual);
  readonly element: Observable<HTMLElement>;

  private _activeWatcher: ActiveScrollWatcher | undefined;

  private constructor(element: Observable<HTMLElement>) {
    super();

    this.element = element;
  }

  initManagedObject() {
    this.addReceipt(
      this.element.didChange.subscribe((element) => {
        if (this._activeWatcher != null) {
          this.removeManagedObject(this._activeWatcher);
          this._activeWatcher = undefined;
        }

        if (element != null) {
          this._activeWatcher = this.addManagedObject(
            new ActiveScrollWatcher(element, this.position)
          );
        }
      }, true)
    );
  }
}
