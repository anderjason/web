"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FocusWatcher = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class FocusWatcher extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._output =
            props.output || observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.output = observable_1.ReadOnlyObservable.givenObservable(this._output);
    }
    onActivate() {
        const onFocus = () => {
            this._output.setValue(true);
        };
        const onBlur = () => {
            this._output.setValue(false);
        };
        this.props.element.addEventListener("focus", onFocus);
        this.props.element.addEventListener("blur", onBlur);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this.props.element.removeEventListener("focus", onFocus);
            this.props.element.removeEventListener("blur", onBlur);
        }));
        this._output.setValue(this.props.element === document.activeElement);
    }
}
exports.FocusWatcher = FocusWatcher;
//# sourceMappingURL=index.js.map