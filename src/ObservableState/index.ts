import { Observable, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { ObjectUtil, ValuePath } from "@anderjason/util";
import { UndoContext } from "../UndoContext";
import { Actor } from "skytree";
import { ObservableStateBinding } from "./_internal/ObservableStateBinding";

export interface ObservableStateProps {
  initialState?: any;
}

export interface ObservableStateChange {
  valuePath: ValuePath;
  oldValue: any;
  newValue: any;
}

export interface ObservableStateBindingDefinition<T> {
  valuePath: ValuePath;

  output?: Observable<T>;
  partialStateGivenOutputValue?: (outputValue: T) => any;
  outputValueGivenPartialState?: (partialState: any) => T;
}

function clone(input: unknown): unknown {
  if (input == null) {
    return input;
  }
  
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

  readonly willChange = new TypedEvent<ObservableStateChange>();

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
      ...definition,
    });
  }

  toOptionalValueGivenPath(path: ValuePath): any {
    return clone(
      ObjectUtil.optionalValueAtPathGivenObject(this._state.value, path)
    );
  }

  update(path: string | string[] | ValuePath, inputValue: any): boolean {
    let valuePath: ValuePath;
    if (typeof path === "string") {
      valuePath = ValuePath.givenString(path);
    } else if (Array.isArray(path)) {
      valuePath = ValuePath.givenParts(path);
    } else {
      valuePath = path;
    }

    const currentValue = ObjectUtil.optionalValueAtPathGivenObject(
      this._state.value,
      valuePath
    );

    if (ObjectUtil.objectIsDeepEqual(currentValue, inputValue)) {
      return false;
    }
    
    const newValue = clone(inputValue);

    this.willChange.emit({
      valuePath,
      oldValue: currentValue,
      newValue
    })

    const obj = ObjectUtil.objectWithValueAtPath(
      this._state.value,
      valuePath,
      newValue  
    );

    this._state.setValue(obj);

    return true;
  }
}
