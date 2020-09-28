import {
  Observable,
  ObservableBase,
  ReadOnlyObservable,
} from "@anderjason/observable";
import { ManagedObject } from "skytree";

export interface StepDelayBindingProps<T> {
  input: ObservableBase<T>;
  stepsBehind: number;

  output?: Observable<T>;
}

export class StepDelayBinding<T> extends ManagedObject<
  StepDelayBindingProps<T>
> {
  private _output: Observable<T>;
  readonly output: ReadOnlyObservable<T>;

  constructor(props: StepDelayBindingProps<T>) {
    super(props);

    if (props.output != null) {
      this._output = props.output;
    } else {
      this._output = Observable.ofEmpty<T>(Observable.isStrictEqual);
    }

    this.output = ReadOnlyObservable.givenObservable(this._output);
  }

  onActivate() {
    const values: T[] = [];

    this.cancelOnDeactivate(
      this.props.input.didChange.subscribe((input) => {
        values.push(input);

        if (values.length > this.props.stepsBehind) {
          this._output.setValue(values.shift());
        }
      }, true)
    );
  }
}
