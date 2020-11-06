import { Actor } from "skytree";
import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Size2 } from "@anderjason/geometry";
import * as ResizeObserverPolyfill from "resize-observer-polyfill";

let LocalResizeObserver: any;

if ("ResizeObserver" in window) {
  LocalResizeObserver = (window as any).ResizeObserver;
} else {
  LocalResizeObserver = ResizeObserverPolyfill;
}

export interface InternalElementSizeWatcherProps {
  element: HTMLElement;
  output: Observable<Size2>;
}

class InternalElementSizeWatcher extends Actor<
  InternalElementSizeWatcherProps
> {
  onActivate() {
    const observer = new LocalResizeObserver((elements: any) => {
      const element = elements[0];
      if (element == null) {
        return;
      }

      const bounds = element.contentRect;
      this.props.output.setValue(
        Size2.givenWidthHeight(bounds.width, bounds.height)
      );
    });

    // start observing
    observer.observe(this.props.element);

    // set initial value

    const initialBounds = this.props.element.getBoundingClientRect();
    this.props.output.setValue(
      Size2.givenWidthHeight(initialBounds.width, initialBounds.height)
    );

    this.cancelOnDeactivate(
      new Receipt(() => {
        observer.disconnect();
        this.props.output.setValue(undefined);
      })
    );
  }
}

export interface ElementSizeWatcherProps {
  element: HTMLElement | Observable<HTMLElement>;

  output?: Observable<Size2>;
}

export class ElementSizeWatcher extends Actor<ElementSizeWatcherProps> {
  private _output: Observable<Size2>;
  readonly output: ReadOnlyObservable<Size2>;

  private _element: Observable<HTMLElement>;
  private _activeWatcher: InternalElementSizeWatcher | undefined;

  constructor(props: ElementSizeWatcherProps) {
    super(props);

    if (Observable.isObservable(props.element)) {
      this._element = props.element;
    } else {
      this._element = Observable.givenValue(props.element);
    }

    this._output = props.output || Observable.ofEmpty<Size2>(Size2.isEqual);
    this.output = ReadOnlyObservable.givenObservable(this._output);
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
            new InternalElementSizeWatcher({
              element,
              output: this._output,
            })
          );
        }
      }, true)
    );
  }
}
