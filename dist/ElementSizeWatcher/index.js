"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementSizeWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const geometry_1 = require("@anderjason/geometry");
const resize_observer_polyfill_1 = require("resize-observer-polyfill");
class InternalElementSizeWatcher extends skytree_1.Actor {
    onActivate() {
        const observer = new resize_observer_polyfill_1.default((elements) => {
            const element = elements[0];
            if (element == null) {
                return;
            }
            const bounds = element.contentRect;
            this.props.output.setValue(geometry_1.Size2.givenWidthHeight(bounds.width, bounds.height));
        });
        // start observing
        observer.observe(this.props.element);
        // set initial value
        const initialBounds = this.props.element.getBoundingClientRect();
        this.props.output.setValue(geometry_1.Size2.givenWidthHeight(initialBounds.width, initialBounds.height));
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            observer.disconnect();
            this.props.output.setValue(undefined);
        }));
    }
}
class ElementSizeWatcher extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (observable_1.Observable.isObservable(props.element)) {
            this._element = props.element;
        }
        else {
            this._element = observable_1.Observable.givenValue(props.element);
        }
        this._output = props.output || observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.output = observable_1.ReadOnlyObservable.givenObservable(this._output);
    }
    onActivate() {
        this.cancelOnDeactivate(this._element.didChange.subscribe((element) => {
            if (this._activeWatcher != null) {
                this.removeActor(this._activeWatcher);
                this._activeWatcher = undefined;
            }
            if (element != null) {
                this._activeWatcher = this.addActor(new InternalElementSizeWatcher({
                    element,
                    output: this._output,
                }));
            }
        }, true));
    }
}
exports.ElementSizeWatcher = ElementSizeWatcher;
//# sourceMappingURL=index.js.map