import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ArrayUtil, ObjectUtil } from "@anderjason/util";

export class UndoContext<T = any> {
  private _currentStep = Observable.ofEmpty<T>(Observable.isStrictEqual);
  readonly currentStep = ReadOnlyObservable.givenObservable(this._currentStep);

  private _undoStack: T[] = [];
  private _redoStack: T[] = [];

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
    this.addStep(initialValue);
  }

  addStep(step: T): void {
    if (ObjectUtil.objectIsDeepEqual(step, this._currentStep.value)) {
      return; // no effect
    }

    if (this._undoStack.length > this._limit - 1) {
      this._undoStack = this._undoStack.slice(
        this._undoStack.length - this._limit + 1
      );
    }

    this._redoStack = [];
    this._undoStack = [...this._undoStack, step];

    this._canUndo.setValue(this._undoStack.length > 1);
    this._canRedo.setValue(this._redoStack.length > 0);

    this._currentStep.setValue(step);
  }

  undo(): boolean {
    if (this._undoStack.length === 0) {
      return false;
    }

    const step = this._undoStack.pop();
    this._redoStack.push(step);

    this._currentStep.setValue(
      ArrayUtil.optionalLastValueGivenArray(this._undoStack)
    );

    this._canUndo.setValue(this._undoStack.length > 1);
    this._canRedo.setValue(this._redoStack.length > 0);

    return true;
  }

  redo(): boolean {
    if (this._redoStack.length === 0) {
      return false;
    }

    const step = this._redoStack.pop();
    this._undoStack.push(step);

    this._currentStep.setValue(step);
    this._canUndo.setValue(this._undoStack.length > 1);
    this._canRedo.setValue(this._redoStack.length > 0);
  }

  clearSteps(): void {
    this._undoStack = [this._currentStep.value];
    this._redoStack = [];

    this._canUndo.setValue(this._undoStack.length > 1);
    this._canRedo.setValue(this._redoStack.length > 0);
  }
}
