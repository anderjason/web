"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.CheckboxBinding = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const allowAll = () => false;
class CheckboxBinding extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (props.inputElement == null) {
            throw new Error("Input element is required");
        }
        const nodeName = props.inputElement.nodeName.toLowerCase();
        if (nodeName !== "input") {
            throw new Error(`Expected an input element, but got '${nodeName}'`);
        }
        this.inputElement = props.inputElement;
        if (this.inputElement.type !== "checkbox") {
            throw new Error(`Expected an input with type "checkbox"`);
        }
        this.isChecked = observable_1.Observable.givenValue(props.initialValue || false, observable_1.Observable.isStrictEqual);
    }
    onActivate() {
        this._previousValue = this.inputElement.checked;
        this.inputElement.addEventListener("input", (e) => {
            const newValue = this.inputElement.checked;
            const shouldPreventChange = this.props.shouldPreventChange || allowAll;
            if (shouldPreventChange(newValue)) {
                this.inputElement.checked = this._previousValue;
                return;
            }
            this.isChecked.setValue(newValue);
            this._previousValue = newValue;
        });
        this.cancelOnDeactivate(this.isChecked.didChange.subscribe((value) => {
            this.inputElement.checked = value;
        }, true));
    }
}
exports.CheckboxBinding = CheckboxBinding;
//# sourceMappingURL=index.js.map