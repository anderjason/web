"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.UndoContext = void 0;
const observable_1 = require("@anderjason/observable");
const util_1 = require("@anderjason/util");
class UndoContext {
    constructor(initialValue, limit) {
        this._output = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.output = observable_1.ReadOnlyObservable.givenObservable(this._output);
        this._currentIndex = observable_1.Observable.ofEmpty();
        this.currentIndex = observable_1.ReadOnlyObservable.givenObservable(this._currentIndex);
        this._steps = observable_1.ObservableArray.ofEmpty();
        this.steps = observable_1.ReadOnlyObservableArray.givenObservableArray(this._steps);
        this._canUndo = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        this.canUndo = observable_1.ReadOnlyObservable.givenObservable(this._canUndo);
        this._canRedo = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        this.canRedo = observable_1.ReadOnlyObservable.givenObservable(this._canRedo);
        this._limit = limit;
        this.pushStep(initialValue);
    }
    pushStep(step) {
        if (util_1.ObjectUtil.objectIsDeepEqual(step, this._output.value)) {
            return; // no effect
        }
        this._steps.removeAllWhere((v, i) => i > this._currentIndex.value);
        if (this._limit != null && this.steps.count === this._limit) {
            this._steps.removeValueAtIndex(0);
        }
        this._steps.addValue(step);
        this.setCurrentIndex(this._steps.count - 1);
    }
    replaceStep(step) {
        if (this._currentIndex.value == null) {
            return;
        }
        if (util_1.ObjectUtil.objectIsDeepEqual(step, this._output.value)) {
            return; // no effect
        }
        this._steps.replaceValueAtIndex(this._currentIndex.value, step);
    }
    undo() {
        if (this._currentIndex.value == null || this._currentIndex.value === 0) {
            return false;
        }
        this.setCurrentIndex(this.currentIndex.value - 1);
        return true;
    }
    redo() {
        if (this._currentIndex.value == null ||
            this._currentIndex.value === this._steps.count - 1) {
            return false;
        }
        this.setCurrentIndex(this.currentIndex.value + 1);
        return true;
    }
    clearSteps(clearBehavior) {
        const current = this._output.value;
        if (current != null && clearBehavior == "keepCurrent") {
            this._steps.sync([current]);
            this.setCurrentIndex(0);
        }
        else {
            this._steps.clear();
            this.setCurrentIndex(undefined);
        }
    }
    setCurrentIndex(index) {
        this._currentIndex.setValue(index);
        this._output.setValue(index != null ? this._steps.toOptionalValueGivenIndex(index) : undefined);
        this._canUndo.setValue(index != null && index > 0);
        this._canRedo.setValue(index != null && index < this._steps.count - 1);
    }
}
exports.UndoContext = UndoContext;
//# sourceMappingURL=index.js.map