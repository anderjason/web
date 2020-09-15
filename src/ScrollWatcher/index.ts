import { ManagedObject } from "skytree";
import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Point2 } from "@anderjason/geometry";
import { MutablePoint2 } from "@anderjason/geometry";

export interface InternalScrollWatcherProps {
  element: HTMLElement;
  position: Observable<Point2>;
}

class InternalScrollWatcher extends ManagedObject<InternalScrollWatcherProps> {
  onActivate() {
    const mutablePoint = MutablePoint2.ofZero();

    const onScroll = () => {
      mutablePoint.x = this.props.element.scrollLeft;
      mutablePoint.y = this.props.element.scrollTop;

      if (this.props.position.value == null) {
        this.props.position.setValue(mutablePoint);
      } else {
        this.props.position.didChange.emit(mutablePoint);
      }
    };

    this.props.element.addEventListener("scroll", onScroll);
    onScroll();

    this.cancelOnDeactivate(
      new Receipt(() => {
        this.props.element.removeEventListener("scroll", onScroll);
        this.props.position.setValue(undefined);
      })
    );
  }
}

export interface ScrollWatcherProps {
  element?: HTMLElement | Observable<HTMLElement>;
}

export class ScrollWatcher extends ManagedObject<ScrollWatcherProps> {
  private _position = Observable.ofEmpty<Point2>(Point2.isEqual);
  readonly position = ReadOnlyObservable.givenObservable(this._position);

  private _element: Observable<HTMLElement>;
  private _activeWatcher: InternalScrollWatcher | undefined;

  constructor(props: ScrollWatcherProps) {
    super(props);

    if (Observable.isObservable(props.element)) {
      this._element = props.element;
    } else {
      this._element = Observable.givenValue(props.element);
    }
  }

  onActivate() {
    this.cancelOnDeactivate(
      this._element.didChange.subscribe((element) => {
        if (this._activeWatcher != null) {
          this.removeManagedObject(this._activeWatcher);
          this._activeWatcher = undefined;
        }

        if (element != null) {
          this._activeWatcher = this.addManagedObject(
            new InternalScrollWatcher({
              element,
              position: this._position,
            })
          );
        }
      }, true)
    );
  }
}
