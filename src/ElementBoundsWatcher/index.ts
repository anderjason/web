import { Actor } from "skytree";
import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Box2 } from "@anderjason/geometry";

export interface InternalElementBoundsWatcherProps {
  element: HTMLElement;
  output: Observable<Box2>;
}

class InternalElementBoundsWatcher extends Actor<
  InternalElementBoundsWatcherProps
> {
  onActivate() {
    // missing Typescript definition for ResizeObserver
    // @ts-ignore
    const observer = new ResizeObserver((elements) => {
      const element = elements[0];
      if (element == null) {
        return;
      }

      const bounds = element.contentRect;
      const box = Box2.givenDomRect(bounds);
      this.props.output.setValue(box);
    });

    // start observing
    observer.observe(this.props.element);

    // set initial value

    this.props.output.setValue(
      Box2.givenDomRect(this.props.element.getBoundingClientRect())
    );

    this.cancelOnDeactivate(
      new Receipt(() => {
        observer.disconnect();
        this.props.output.setValue(undefined);
      })
    );
  }
}

export interface ElementBoundsWatcherProps {
  element: HTMLElement | Observable<HTMLElement>;

  output?: Observable<Box2>;
}

export class ElementBoundsWatcher extends Actor<ElementBoundsWatcherProps> {
  private _output: Observable<Box2>;
  readonly output: ReadOnlyObservable<Box2>;

  private _element: Observable<HTMLElement>;
  private _activeWatcher: InternalElementBoundsWatcher | undefined;

  constructor(props: ElementBoundsWatcherProps) {
    super(props);

    if (Observable.isObservable(props.element)) {
      this._element = props.element;
    } else {
      this._element = Observable.givenValue(props.element);
    }

    this._output = props.output || Observable.ofEmpty<Box2>(Box2.isEqual);
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
            new InternalElementBoundsWatcher({
              element,
              output: this._output,
            })
          );
        }
      }, true)
    );
  }
}
