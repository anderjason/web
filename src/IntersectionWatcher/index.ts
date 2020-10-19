import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Percent } from "@anderjason/util";
import { Actor } from "skytree";

export interface InternalIntersectionWatcherProps {
  element: HTMLElement;
  minimumVisiblePercent: Percent;
  isElementVisible: Observable<boolean>;

  scrollElement?: HTMLElement;
  rootMargin?: string;
}

class InternalIntersectionWatcher extends Actor<
  InternalIntersectionWatcherProps
> {
  onActivate() {
    const threshold = this.props.minimumVisiblePercent.toNumber(1);

    const observer = new IntersectionObserver(
      (elements) => {
        const element = elements[0];
        if (element == null) {
          return;
        }

        this.props.isElementVisible.setValue(element.isIntersecting == true);
      },
      {
        root: this.props.scrollElement || this.props.element.parentElement,
        rootMargin: this.props.rootMargin,
        threshold,
      }
    );

    observer.observe(this.props.element);

    this.cancelOnDeactivate(
      new Receipt(() => {
        observer.disconnect();
        this.props.isElementVisible.setValue(undefined);
      })
    );
  }
}

export interface IntersectionWatcherProps {
  element: HTMLElement | Observable<HTMLElement>;
  minimumVisiblePercent: Percent;

  scrollElement?: HTMLElement;
  rootMargin?: string;
  isElementVisible?: Observable<boolean>;
}

export class IntersectionWatcher extends Actor<IntersectionWatcherProps> {
  private _isElementVisible: Observable<boolean>;
  readonly isElementVisible: ReadOnlyObservable<boolean>;

  private _element: Observable<HTMLElement>;
  private _activeWatcher: InternalIntersectionWatcher | undefined;

  constructor(props: IntersectionWatcherProps) {
    super(props);

    if (Observable.isObservable(props.element)) {
      this._element = props.element;
    } else {
      this._element = Observable.givenValue(props.element);
    }

    this._isElementVisible =
      props.isElementVisible ||
      Observable.ofEmpty<boolean>(Observable.isStrictEqual);
    this.isElementVisible = ReadOnlyObservable.givenObservable(
      this._isElementVisible
    );
  }

  onActivate() {
    this.cancelOnDeactivate(
      this._element.didChange.subscribe((element) => {
        if (this._activeWatcher != null) {
          this.removeActor(this._activeWatcher);
          this._activeWatcher = undefined;
        }

        if (element != null) {
          this._activeWatcher = this.addActor(
            new InternalIntersectionWatcher({
              element,
              minimumVisiblePercent: this.props.minimumVisiblePercent,
              isElementVisible: this._isElementVisible,
              rootMargin: this.props.rootMargin,
              scrollElement: this.props.scrollElement,
            })
          );
        }
      }, true)
    );
  }
}
