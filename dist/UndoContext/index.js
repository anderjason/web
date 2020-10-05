"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoContext = void 0;
const observable_1 = require("@anderjason/observable");
const util_1 = require("@anderjason/util");
class UndoContext {
    constructor(initialValue, limit) {
        this._currentStep = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.currentStep = observable_1.ReadOnlyObservable.givenObservable(this._currentStep);
        this._undoStack = [];
        this._redoStack = [];
        this._canUndo = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        this.canUndo = observable_1.ReadOnlyObservable.givenObservable(this._canUndo);
        this._canRedo = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        this.canRedo = observable_1.ReadOnlyObservable.givenObservable(this._canRedo);
        this._limit = limit;
        this.addStep(initialValue);
    }
    addStep(step) {
        if (util_1.ObjectUtil.objectIsDeepEqual(step, this._currentStep.value)) {
            return; // no effect
        }
        if (this._undoStack.length > this._limit - 1) {
            this._undoStack = this._undoStack.slice(this._undoStack.length - this._limit + 1);
        }
        this._redoStack = [];
        this._undoStack = [...this._undoStack, step];
        this._canUndo.setValue(this._undoStack.length > 1);
        this._canRedo.setValue(this._redoStack.length > 0);
        this._currentStep.setValue(step);
    }
    undo() {
        if (this._undoStack.length === 0) {
            return false;
        }
        const step = this._undoStack.pop();
        this._redoStack.push(step);
        this._currentStep.setValue(util_1.ArrayUtil.optionalLastValueGivenArray(this._undoStack));
        this._canUndo.setValue(this._undoStack.length > 1);
        this._canRedo.setValue(this._redoStack.length > 0);
        return true;
    }
    redo() {
        if (this._redoStack.length === 0) {
            return false;
        }
        const step = this._redoStack.pop();
        this._undoStack.push(step);
        this._currentStep.setValue(step);
        this._canUndo.setValue(this._undoStack.length > 1);
        this._canRedo.setValue(this._redoStack.length > 0);
    }
    clearSteps() {
        this._undoStack = [this._currentStep.value];
        this._redoStack = [];
        this._canUndo.setValue(this._undoStack.length > 1);
        this._canRedo.setValue(this._redoStack.length > 0);
    }
}
exports.UndoContext = UndoContext;
//# sourceMappingURL=index.js.map