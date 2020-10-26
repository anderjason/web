import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { ObjectUtil, ValuePath } from "@anderjason/util";
import { UndoContext } from "../UndoContext";
import { Actor, PathBinding } from "skytree";
import { ObservableStateBinding } from "./_internal/ObservableStateBinding";

export interface ObservableStateProps {
  initialState?: any;
}

export interface ObservableStateBindingDefinition<T> {
  valuePath: ValuePath;

  output?: Observable<T>;
  partialStateGivenOutputValue?: (outputValue: T) => any;
  outputValueGivenPartialState?: (partialState: any) => T;
}

function clone(input: unknown): unknown {
  if (typeof input === "object") {
    return ObjectUtil.objectWithDeepMerge({}, input);
  } else if (Array.isArray(input)) {
    return ObjectUtil.objectWithDeepMerge([], input);
  } else {
    return input;
  }
}

export class ObservableState extends Actor<ObservableStateProps> {
  private _state = Observable.ofEmpty<unknown>(Observable.isStrictEqual);
  readonly state = ReadOnlyObservable.givenObservable(this._state);

  private _undoContext: UndoContext;
  private _pathBindings = new Set<PathBinding<unknown, unknown>>();

  onActivate() {
    this._undoContext = new UndoContext<unknown>(
      clone(this.props.initialState || {}),
      10
    );

    this.cancelOnDeactivate(
      this._undoContext.output.didChange.subscribe((undoStep) => {
        this._state.setValue(clone(undoStep));
      }, true)
    );
  }

  get undoContext(): UndoContext {
    return this._undoContext;
  }

  subscribe(
    valuePath: ValuePath,
    fn: (value: any) => void,
    includeLast = false
  ): Receipt {
    const binding = this.addActor(
      new PathBinding({
        input: this._state,
        path: valuePath,
      })
    );

    this._pathBindings.add(binding);

    const innerHandle = this.cancelOnDeactivate(
      binding.output.didChange.subscribe((value) => {
        fn(value);
      }, includeLast)
    );

    return new Receipt(() => {
      this._pathBindings.delete(binding);

      innerHandle.cancel();
      this.removeCancelOnDeactivate(innerHandle);
      this.removeActor(binding);
    });
  }

  toBinding<T>(
    definition: ObservableStateBindingDefinition<T>
  ): ObservableStateBinding<T> {
    return new ObservableStateBinding<T>({
      observableState: this,
      ...definition,
    });
  }

  toOptionalValueGivenPath(path: ValuePath): any {
    return clone(
      ObjectUtil.optionalValueAtPathGivenObject(this._state.value, path)
    );
  }

  update(path: ValuePath, inputValue: any): void {
    // const currentValue = ObjectUtil.optionalValueAtPathGivenObject(
    //   this._state.value,
    //   path
    // );

    // if (ObjectUtil.objectIsDeepEqual(currentValue, inputValue)) {
    //   return;
    // }

    const obj = ObjectUtil.objectWithValueAtPath(
      this._state.value,
      path,
      clone(inputValue)
    );

    this._state.setValue(obj);
  }
}
