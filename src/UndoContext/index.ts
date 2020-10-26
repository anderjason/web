import {
  Observable,
  ObservableArray,
  ReadOnlyObservable,
  ReadOnlyObservableArray,
} from "@anderjason/observable";
import { ObjectUtil } from "@anderjason/util";

export type UndoClearBehavior = "keepCurrent" | "clearAll";

export class UndoContext<T = any> {
  private _output = Observable.ofEmpty<T>(Observable.isStrictEqual);
  readonly output = ReadOnlyObservable.givenObservable(this._output);

  private _currentIndex = Observable.ofEmpty<number>();
  readonly currentIndex = ReadOnlyObservable.givenObservable(
    this._currentIndex
  );

  private _steps = ObservableArray.ofEmpty<T>();
  readonly steps = ReadOnlyObservableArray.givenObservableArray(this._steps);

  private _canUndo = Observable.givenValue<boolean>(
    false,
    Observable.isStrictEqual
  );
  readonly canUndo = ReadOnlyObservable.givenObservable(this._canUndo);

  private _canRedo = Observable.givenValue<boolean>(
    false,
    Observable.isStrictEqual
  );
  readonly canRedo = ReadOnlyObservable.givenObservable(this._canRedo);

  private _limit: number;

  constructor(initialValue: T, limit: number) {
    this._limit = limit;
    this.pushStep(initialValue);
  }

  pushStep(step: T): void {
    if (ObjectUtil.objectIsDeepEqual(step, this._output.value)) {
      return; // no effect
    }

    this._steps.removeAllWhere((v, i) => i > this._currentIndex.value);

    if (this._limit != null && this.steps.count === this._limit) {
      this._steps.removeValueAtIndex(0);
    }

    this._steps.addValue(step);

    this.setCurrentIndex(this._steps.count - 1);
  }

  replaceStep(step: T): void {
    if (this._currentIndex.value == null) {
      return;
    }

    if (ObjectUtil.objectIsDeepEqual(step, this._output.value)) {
      return; // no effect
    }

    this._steps.replaceValueAtIndex(this._currentIndex.value, step);
  }

  undo(): boolean {
    if (this._currentIndex.value == null || this._currentIndex.value === 0) {
      return false;
    }

    this.setCurrentIndex(this.currentIndex.value - 1);

    return true;
  }

  redo(): boolean {
    if (
      this._currentIndex.value == null ||
      this._currentIndex.value === this._steps.count - 1
    ) {
      return false;
    }

    this.setCurrentIndex(this.currentIndex.value + 1);

    return true;
  }

  clearSteps(clearBehavior: UndoClearBehavior): void {
    const current = this._output.value;

    if (current != null && clearBehavior == "keepCurrent") {
      this._steps.sync([current]);
      this.setCurrentIndex(0);
    } else {
      this._steps.clear();
      this.setCurrentIndex(undefined);
    }
  }

  private setCurrentIndex(index: number | undefined): void {
    this._currentIndex.setValue(index);
    this._output.setValue(
      index != null ? this._steps.toOptionalValueGivenIndex(index) : undefined
    );
    this._canUndo.setValue(index != null && index > 0);
    this._canRedo.setValue(index != null && index < this._steps.count - 1);
  }
}
