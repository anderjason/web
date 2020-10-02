import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { ManagedObject } from "skytree";

export interface FocusWatcherProps {
  element: HTMLInputElement | HTMLTextAreaElement;

  output?: Observable<boolean>;
}

export class FocusWatcher extends ManagedObject<FocusWatcherProps> {
  private _output: Observable<boolean>;
  readonly output: ReadOnlyObservable<boolean>;

  constructor(props: FocusWatcherProps) {
    super(props);

    this._output =
      props.output || Observable.ofEmpty<boolean>(Observable.isStrictEqual);

    this.output = ReadOnlyObservable.givenObservable(this._output);
  }

  onActivate() {
    const onFocus = () => {
      this._output.setValue(true);
    };

    const onBlur = () => {
      this._output.setValue(false);
    };

    this.props.element.addEventListener("focus", onFocus);
    this.props.element.addEventListener("blur", onBlur);

    this.cancelOnDeactivate(
      new Receipt(() => {
        this.props.element.removeEventListener("focus", onFocus);
        this.props.element.removeEventListener("blur", onBlur);
      })
    );

    this._output.setValue(this.props.element === document.activeElement);
  }
}
