"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.LocalStorageBinding = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class LocalStorageBinding extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this.observableValue =
            this.props.value || observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
    }
    onActivate() {
        try {
            this.observableValue.setValue(window.localStorage.getItem(this.props.localStorageKey));
        }
        catch (err) {
            console.warn(err);
        }
        this.cancelOnDeactivate(this.observableValue.didChange.subscribe((value) => {
            try {
                if (value != null) {
                    window.localStorage.setItem(this.props.localStorageKey, value);
                }
                else {
                    window.localStorage.removeItem(this.props.localStorageKey);
                }
            }
            catch (err) {
                console.warn(err);
            }
        }, true));
    }
}
exports.LocalStorageBinding = LocalStorageBinding;
//# sourceMappingURL=index.js.map