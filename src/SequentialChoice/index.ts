import { Observable, ReadOnlyObservable } from "@anderjason/observable";

export interface SequentialChoiceProps<T> {
  options: T[];

  output?: Observable<T>;
}

export class SequentialChoice<T> {
  readonly currentOption: Observable<T>;

  private _nextOption = Observable.ofEmpty<T>();
  readonly nextOption = ReadOnlyObservable.givenObservable(this._nextOption);

  private _previousOption = Observable.ofEmpty<T>();
  readonly previousOption = ReadOnlyObservable.givenObservable(
    this._previousOption
  );

  private _currentIdx: number;

  private props: SequentialChoiceProps<T>;

  constructor(props: SequentialChoiceProps<T>) {
    this.props = props;

    this.currentOption =
      props.output || Observable.ofEmpty(Observable.isStrictEqual);

    if (props.options.length > 0) {
      // is an option already selected?
      if (this.currentOption.value != null) {
        // is the selected option in the list?
        const index = props.options.indexOf(this.currentOption.value);
        if (index !== -1) {
          this.setCurrentIndex(index);
        } else {
          // if not, ignore the selection
          this.currentOption.setValue(undefined);
        }
      }

      // if there's no selection, set the first item
      if (this.currentOption.value == null) {
        this.setCurrentIndex(0);
      }
    }
  }

  private setCurrentIndex = (idx: number): void => {
    const len = this.props.options.length;

    if (this.props.options == null || len === 0) {
      this._currentIdx = undefined;
    }

    this.currentOption.setValue(this.props.options[idx % len]);

    if (len > 1) {
      this._nextOption.setValue(this.props.options[(idx + 1) % len]);

      if (idx < 1) {
        const previousIdx = len - (Math.abs(idx - 1) % len);
        this._previousOption.setValue(this.props.options[previousIdx]);
      } else {
        this._previousOption.setValue(this.props.options[(idx - 1) % len]);
      }
    }

    this._currentIdx = idx;
  };

  selectNextOption = (): void => {
    this.setCurrentIndex(this._currentIdx + 1);
  };

  selectPreviousOption = (): void => {
    if (this._currentIdx === 0) {
      this.setCurrentIndex(this.props.options.length - 1);
    } else {
      this.setCurrentIndex(this._currentIdx - 1);
    }
  };
}
