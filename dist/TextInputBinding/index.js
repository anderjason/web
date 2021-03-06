"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TextInputBinding = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const util_1 = require("@anderjason/util");
class TextInputBinding extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._displayText = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.displayText = observable_1.ReadOnlyObservable.givenObservable(this._displayText);
        this._isEmpty = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.isEmpty = observable_1.ReadOnlyObservable.givenObservable(this._isEmpty);
        this._rawInputValue = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.rawInputText = observable_1.ReadOnlyObservable.givenObservable(this._rawInputValue);
        if (props.inputElement == null) {
            throw new Error("Input is required");
        }
        const nodeName = props.inputElement.nodeName.toLowerCase();
        if (nodeName !== "input" && nodeName !== "textarea") {
            throw new Error(`Expected an input or textarea element, but got '${nodeName}'`);
        }
        this._inputElement = props.inputElement;
        this.output =
            this.props.value || observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
    }
    onActivate() {
        this._previousDisplayText = this._inputElement.value;
        this._inputElement.addEventListener("keydown", (e) => {
            this._previousDisplayText = this._inputElement.value;
            this._rawInputValue.setValue(this._inputElement.value);
            this._isEmpty.setValue(util_1.StringUtil.stringIsEmpty(this._inputElement.value));
        });
        this._inputElement.addEventListener("input", (e) => {
            const displayText = this._inputElement.value;
            let value = this.props.valueGivenDisplayText(displayText);
            let overrideResult;
            if (this.props.overrideDisplayText != null) {
                const actualOverrideResult = this.props.overrideDisplayText({
                    displayText,
                    value,
                    previousDisplayText: this._previousDisplayText,
                    previousValue: this.output.value,
                    caretPosition: this._inputElement.selectionStart
                });
                if (typeof actualOverrideResult === "string") {
                    overrideResult = {
                        text: actualOverrideResult,
                        caretPosition: undefined
                    };
                }
                else {
                    overrideResult = actualOverrideResult;
                }
                if (overrideResult == null) {
                    this.onOverride(this._previousDisplayText, this._caretPosition);
                    return;
                }
                else {
                    this.onOverride(overrideResult.text, overrideResult.caretPosition);
                    value = this.props.valueGivenDisplayText(overrideResult.text);
                }
            }
            this.output.setValue(value);
            if (overrideResult != null) {
                requestAnimationFrame(() => {
                    this._inputElement.value = overrideResult.text;
                    if (this._caretPosition != null) {
                        if (this._inputElement == document.activeElement) {
                            this._inputElement.setSelectionRange(this._caretPosition, this._caretPosition);
                        }
                        this._caretPosition = null;
                    }
                    this._rawInputValue.setValue(this._inputElement.value);
                    this._isEmpty.setValue(util_1.StringUtil.stringIsEmpty(this._inputElement.value));
                });
            }
        });
        this.cancelOnDeactivate(this.output.didChange.subscribe((value) => {
            const displayText = this.props.displayTextGivenValue(value);
            const startPos = this._inputElement.selectionStart;
            const endPos = this._inputElement.selectionEnd;
            this._inputElement.value = displayText || "";
            if (this._inputElement == document.activeElement) {
                this._inputElement.setSelectionRange(startPos, endPos);
            }
            this._rawInputValue.setValue(this._inputElement.value);
            this._isEmpty.setValue(util_1.StringUtil.stringIsEmpty(this._inputElement.value));
        }, true));
    }
    onOverride(text, caretPosition) {
        this._previousDisplayText = text;
        this._inputElement.value = text;
        if (caretPosition != null) {
            this._caretPosition = caretPosition;
            if (this._inputElement == document.activeElement) {
                this._inputElement.setSelectionRange(caretPosition, caretPosition);
            }
        }
        this._rawInputValue.setValue(text);
        this._isEmpty.setValue(util_1.StringUtil.stringIsEmpty(text));
    }
}
exports.TextInputBinding = TextInputBinding;
//# sourceMappingURL=index.js.map