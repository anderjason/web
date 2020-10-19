"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementBoundsWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const geometry_1 = require("@anderjason/geometry");
class InternalElementBoundsWatcher extends skytree_1.Actor {
    onActivate() {
        // missing Typescript definition for ResizeObserver
        // @ts-ignore
        const observer = new ResizeObserver((elements) => {
            const element = elements[0];
            if (element == null) {
                return;
            }
            const bounds = element.contentRect;
            const box = geometry_1.Box2.givenDomRect(bounds);
            this.props.output.setValue(box);
        });
        // start observing
        observer.observe(this.props.element);
        // set initial value
        this.props.output.setValue(geometry_1.Box2.givenDomRect(this.props.element.getBoundingClientRect()));
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            observer.disconnect();
            this.props.output.setValue(undefined);
        }));
    }
}
class ElementBoundsWatcher extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (observable_1.Observable.isObservable(props.element)) {
            this._element = props.element;
        }
        else {
            this._element = observable_1.Observable.givenValue(props.element);
        }
        this._output = props.output || observable_1.Observable.ofEmpty(geometry_1.Box2.isEqual);
        this.output = observable_1.ReadOnlyObservable.givenObservable(this._output);
    }
    onActivate() {
        this.cancelOnDeactivate(this._element.didChange.subscribe((element) => {
            if (this._activeWatcher != null) {
                this.removeActor(this._activeWatcher);
                this._activeWatcher = undefined;
            }
            if (element != null) {
                this._activeWatcher = this.addActor(new InternalElementBoundsWatcher({
                    element,
                    output: this._output,
                }));
            }
        }, true));
    }
}
exports.ElementBoundsWatcher = ElementBoundsWatcher;
//# sourceMappingURL=index.js.map