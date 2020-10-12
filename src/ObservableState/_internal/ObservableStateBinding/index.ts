import { Observable } from "@anderjason/observable";
import { ValuePath } from "@anderjason/util";
import { Actor } from "skytree";
import { ObservableState } from "../..";

export interface ObservableStateBindingProps<T> {
  observableState: ObservableState;
  valuePath: ValuePath;

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
    this.cancelOnDeactivate(
      this.props.observableState.subscribe(
        this.props.valuePath,
        (vccValue) => {
          let result = vccValue;
          if (this.props.outputValueGivenPartialState != null) {
            result = this.props.outputValueGivenPartialState(result);
          }

          this.output.setValue(result);
        },
        true
      )
    );

    this.cancelOnDeactivate(
      this.output.didChange.subscribe((value) => {
        let result = value;
        if (this.props.partialStateGivenOutputValue != null) {
          result = this.props.outputValueGivenPartialState(result);
        }

        this.props.observableState.update(this.props.valuePath, result);
      })
    );
  }
}
