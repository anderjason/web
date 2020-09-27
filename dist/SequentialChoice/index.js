"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.SequentialChoice = void 0;
const observable_1 = require("@anderjason/observable");
class SequentialChoice {
    constructor(props) {
        this._nextOption = observable_1.Observable.ofEmpty();
        this.nextOption = observable_1.ReadOnlyObservable.givenObservable(this._nextOption);
        this._previousOption = observable_1.Observable.ofEmpty();
        this.previousOption = observable_1.ReadOnlyObservable.givenObservable(this._previousOption);
        this.setCurrentIndex = (idx) => {
            const len = this.props.options.length;
            if (this.props.options == null || len === 0) {
                this._currentIdx = undefined;
            }
            this.currentOption.setValue(this.props.options[idx % len]);
            if (len > 1) {
                this._nextOption.setValue(this.props.options[(idx + 1) % len]);
                if (idx < 1) {
                    const previousIdx = len - (Math.abs(idx - 1) % len);
                    this._previousOption.setValue(this.props.options[previousIdx]);
                }
                else {
                    this._previousOption.setValue(this.props.options[(idx - 1) % len]);
                }
            }
            this._currentIdx = idx;
        };
        this.selectNextOption = () => {
            this.setCurrentIndex(this._currentIdx + 1);
        };
        this.selectPreviousOption = () => {
            if (this._currentIdx === 0) {
                this.setCurrentIndex(this.props.options.length - 1);
            }
            else {
                this.setCurrentIndex(this._currentIdx - 1);
            }
        };
        this.props = props;
        this.currentOption =
            props.output || observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        if (props.options.length > 0) {
            // is an option already selected?
            if (this.currentOption.value != null) {
                // is the selected option in the list?
                const index = props.options.indexOf(this.currentOption.value);
                if (index !== -1) {
                    this.setCurrentIndex(index);
                }
                else {
                    // if not, ignore the selection
                    this.currentOption.setValue(undefined);
                }
            }
            // if there's no selection, set the first item
            if (this.currentOption.value == null) {
                this.setCurrentIndex(0);
            }
        }
    }
}
exports.SequentialChoice = SequentialChoice;
//# sourceMappingURL=index.js.map