"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObservableStateBinding = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class ObservableStateBinding extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (props.output != null) {
            this.output = props.output;
        }
        else {
            this.output = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        }
    }
    onActivate() {
        let isUpdating = false;
        this.cancelOnDeactivate(this.props.observableState.subscribe(this.props.valuePath, (vccValue) => {
            isUpdating = true;
            let result = vccValue;
            if (this.props.outputValueGivenPartialState != null) {
                result = this.props.outputValueGivenPartialState(result);
            }
            this.output.setValue(result);
            isUpdating = false;
        }, true));
        this.cancelOnDeactivate(this.output.didChange.subscribe((value) => {
            if (isUpdating == true) {
                return;
            }
            let result = value;
            if (this.props.partialStateGivenOutputValue != null) {
                result = this.props.outputValueGivenPartialState(result);
            }
            this.props.observableState.update(this.props.valuePath, result);
        }));
    }
}
exports.ObservableStateBinding = ObservableStateBinding;
//# sourceMappingURL=index.js.map