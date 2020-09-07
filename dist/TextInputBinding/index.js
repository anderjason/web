"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputBinding = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const allowAll = () => false;
class TextInputBinding extends skytree_1.ManagedObject {
    constructor(definition) {
        super();
        if (definition.input == null) {
            throw new Error("Input is required");
        }
        const nodeName = definition.input.nodeName.toLowerCase();
        if (nodeName !== "input" && nodeName !== "textarea") {
            throw new Error(`Expected an input or textarea element, but got '${nodeName}'`);
        }
        this.input = definition.input;
        this.text = observable_1.Observable.givenValue(definition.initialValue || "", observable_1.Observable.isStrictEqual);
        this._shouldPreventChange = definition.shouldPreventChange || allowAll;
    }
    static givenDefinition(definition) {
        return new TextInputBinding(definition);
    }
    initManagedObject() {
        this._previousValue = this.input.value;
        this._caretPosition = this.input.selectionStart;
        this.input.addEventListener("keydown", (e) => {
            this._caretPosition = this.input.selectionStart;
        });
        this.input.addEventListener("input", (e) => {
            const newValue = this.input.value;
            if (this._shouldPreventChange(newValue)) {
                this.undoChange();
                return;
            }
            this.text.setValue(newValue);
            this._previousValue = newValue;
        });
        this.addReceipt(this.text.didChange.subscribe((value) => {
            this.input.value = value;
        }, true));
    }
    undoChange() {
        this.input.value = this._previousValue;
        this.input.setSelectionRange(this._caretPosition, this._caretPosition);
    }
}
exports.TextInputBinding = TextInputBinding;
//# sourceMappingURL=index.js.map