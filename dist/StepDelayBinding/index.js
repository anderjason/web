"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.StepDelayBinding = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class StepDelayBinding extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (props.output != null) {
            this._output = props.output;
        }
        else {
            this._output = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        }
        this.output = observable_1.ReadOnlyObservable.givenObservable(this._output);
    }
    onActivate() {
        const values = [];
        this.cancelOnDeactivate(this.props.input.didChange.subscribe((input) => {
            values.push(input);
            if (values.length > this.props.stepsBehind) {
                this._output.setValue(values.shift());
            }
        }, true));
    }
}
exports.StepDelayBinding = StepDelayBinding;
//# sourceMappingURL=index.js.map