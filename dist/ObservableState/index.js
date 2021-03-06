"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableState = void 0;
const observable_1 = require("@anderjason/observable");
const util_1 = require("@anderjason/util");
const UndoContext_1 = require("../UndoContext");
const skytree_1 = require("skytree");
const ObservableStateBinding_1 = require("./_internal/ObservableStateBinding");
function clone(input) {
    if (input == null) {
        return input;
    }
    if (typeof input === "object") {
        return util_1.ObjectUtil.objectWithDeepMerge({}, input);
    }
    else if (Array.isArray(input)) {
        return util_1.ObjectUtil.objectWithDeepMerge([], input);
    }
    else {
        return input;
    }
}
class ObservableState extends skytree_1.Actor {
    constructor() {
        super(...arguments);
        this._state = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.state = observable_1.ReadOnlyObservable.givenObservable(this._state);
        this.willChange = new observable_1.TypedEvent();
    }
    onActivate() {
        this._undoContext = new UndoContext_1.UndoContext(clone(this.props.initialState || {}), 10);
        this.cancelOnDeactivate(this._undoContext.output.didChange.subscribe((undoStep) => {
            this._state.setValue(clone(undoStep));
        }, true));
    }
    get undoContext() {
        return this._undoContext;
    }
    pushCurrentState() {
        if (this.state.value == null) {
            return;
        }
        this._undoContext.pushStep(this.state.value);
    }
    toBinding(definition) {
        return new ObservableStateBinding_1.ObservableStateBinding(Object.assign({ observableState: this }, definition));
    }
    toOptionalValueGivenPath(path) {
        return clone(util_1.ObjectUtil.optionalValueAtPathGivenObject(this._state.value, path));
    }
    update(path, inputValue) {
        let valuePath;
        if (typeof path === "string") {
            valuePath = util_1.ValuePath.givenString(path);
        }
        else if (Array.isArray(path)) {
            valuePath = util_1.ValuePath.givenParts(path);
        }
        else {
            valuePath = path;
        }
        const currentValue = util_1.ObjectUtil.optionalValueAtPathGivenObject(this._state.value, valuePath);
        if (util_1.ObjectUtil.objectIsDeepEqual(currentValue, inputValue)) {
            return false;
        }
        const newValue = clone(inputValue);
        this.willChange.emit({
            valuePath,
            oldValue: currentValue,
            newValue
        });
        const obj = util_1.ObjectUtil.objectWithValueAtPath(this._state.value, valuePath, newValue);
        this._state.setValue(obj);
        return true;
    }
}
exports.ObservableState = ObservableState;
//# sourceMappingURL=index.js.map