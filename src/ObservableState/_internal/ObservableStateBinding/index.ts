import { Observable } from "@anderjason/observable";
import { ValuePath } from "@anderjason/util";
import { Actor, PathBinding } from "skytree";
import { ObservableState } from "../..";

export interface ObservableStateBindingProps<T> {
  observableState: ObservableState;
  valuePath: ValuePath<T>;

  output?: Observable<T>;
  partialStateGivenOutputValue?: (outputValue: T) => any;
  outputValueGivenPartialState?: (partialState: any) => T;
}

export class ObservableStateBinding<T> extends Actor<
  ObservableStateBindingProps<T>
> {
  readonly output: Observable<T>;

  constructor(props: ObservableStateBindingProps<T>) {
    super(props);

    if (props.output != null) {
      this.output = props.output;
    } else {
      this.output = Observable.ofEmpty<T>(Observable.isStrictEqual);
    }
  }

  onActivate() {
    let isUpdating = false;

    const binding = this.addActor(
      new PathBinding<any, T>({
        input: this.props.observableState.state,
        path: this.props.valuePath,
      })
    );

    this.cancelOnDeactivate(
      binding.output.didChange.subscribe((vccValue) => {
        isUpdating = true;

        let result = vccValue;
        if (this.props.outputValueGivenPartialState != null) {
          result = this.props.outputValueGivenPartialState(result);
        }

        this.output.setValue(result);

        isUpdating = false;
      }, true)
    );

    this.cancelOnDeactivate(
      this.output.didChange.subscribe((value) => {
        if (isUpdating == true) {
          return;
        }

        let result = value;
        if (this.props.partialStateGivenOutputValue != null) {
          result = this.props.partialStateGivenOutputValue(result);
        }

        this.props.observableState.update(this.props.valuePath, result);
      })
    );
  }
}
