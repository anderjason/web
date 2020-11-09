import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ObjectUtil, ValuePath } from "@anderjason/util";
import { UndoContext } from "../UndoContext";
import { Actor } from "skytree";
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

  pushCurrentState(): void {
    if (this.state.value == null) {
      return;
    }

    this._undoContext.pushStep(this.state.value);
  }

  toBinding<T>(
    definition: ObservableStateBindingDefinition<T>
  ): ObservableStateBinding<T> {
    return new ObservableStateBinding<T>({
      observableState: this,
      onRequestUpdate: this.onRequestUpdate,
      ...definition,
    });
  }

  toOptionalValueGivenPath(path: ValuePath): any {
    return clone(
      ObjectUtil.optionalValueAtPathGivenObject(this._state.value, path)
    );
  }

  private onRequestUpdate = (path: ValuePath, inputValue: any): boolean => {
    const currentValue = ObjectUtil.optionalValueAtPathGivenObject(
      this._state.value,
      path
    );

    if (ObjectUtil.objectIsDeepEqual(currentValue, inputValue)) {
      return false;
    }

    const obj = ObjectUtil.objectWithValueAtPath(
      this._state.value,
      path,
      clone(inputValue)
    );

    this._state.setValue(obj);

    return true;
  };
}
