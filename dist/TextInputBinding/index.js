"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputBinding = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const allowAll = () => false;
class TextInputBinding extends skytree_1.ManagedObject {
    constructor(props) {
        super(props);
        if (props.inputElement == null) {
            throw new Error("Input is required");
        }
        const nodeName = props.inputElement.nodeName.toLowerCase();
        if (nodeName !== "input" && nodeName !== "textarea") {
            throw new Error(`Expected an input or textarea element, but got '${nodeName}'`);
        }
        this._inputElement = props.inputElement;
        this.text = observable_1.Observable.givenValue(props.initialValue || "", observable_1.Observable.isStrictEqual);
        this._shouldPreventChange = props.shouldPreventChange || allowAll;
    }
    onActivate() {
        this._previousValue = this._inputElement.value;
        this._caretPosition = this._inputElement.selectionStart;
        this._inputElement.addEventListener("keydown", (e) => {
            this._caretPosition = this._inputElement.selectionStart;
        });
        this._inputElement.addEventListener("input", (e) => {
            const newValue = this._inputElement.value;
            if (this._shouldPreventChange(newValue)) {
                this.undoChange();
                return;
            }
            this.text.setValue(newValue);
            this._previousValue = newValue;
        });
        this.cancelOnDeactivate(this.text.didChange.subscribe((value) => {
            this._inputElement.value = value;
        }, true));
    }
    undoChange() {
        this._inputElement.value = this._previousValue;
        this._inputElement.setSelectionRange(this._caretPosition, this._caretPosition);
    }
}
exports.TextInputBinding = TextInputBinding;
//# sourceMappingURL=index.js.map