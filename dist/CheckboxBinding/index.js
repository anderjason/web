"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxBinding = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const allowAll = () => false;
class CheckboxBinding extends skytree_1.ManagedObject {
    constructor(definition) {
        super();
        if (definition.input == null) {
            throw new Error("Input is required");
        }
        const nodeName = definition.input.nodeName.toLowerCase();
        if (nodeName !== "input") {
            throw new Error(`Expected an input element, but got '${nodeName}'`);
        }
        this.input = definition.input;
        if (this.input.type !== "checkbox") {
            throw new Error(`Expected an input with type "checkbox"`);
        }
        this.isChecked = observable_1.Observable.givenValue(definition.initialValue || false, observable_1.Observable.isStrictEqual);
        this._shouldPreventChange = definition.shouldPreventChange || allowAll;
    }
    static givenDefinition(definition) {
        return new CheckboxBinding(definition);
    }
    initManagedObject() {
        this._previousValue = this.input.checked;
        this.input.addEventListener("input", (e) => {
            const newValue = this.input.checked;
            if (this._shouldPreventChange(newValue)) {
                this.undoChange();
                return;
            }
            this.isChecked.setValue(newValue);
            this._previousValue = newValue;
        });
        this.addReceipt(this.isChecked.didChange.subscribe((value) => {
            this.input.checked = value;
        }, true));
    }
    undoChange() {
        this.input.checked = this._previousValue;
    }
}
exports.CheckboxBinding = CheckboxBinding;
//# sourceMappingURL=index.js.map