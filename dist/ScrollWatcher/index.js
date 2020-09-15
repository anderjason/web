"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const geometry_1 = require("@anderjason/geometry");
const geometry_2 = require("@anderjason/geometry");
class InternalScrollWatcher extends skytree_1.ManagedObject {
    onActivate() {
        const mutablePoint = geometry_2.MutablePoint2.ofZero();
        const onScroll = () => {
            mutablePoint.x = this.props.element.scrollLeft;
            mutablePoint.y = this.props.element.scrollTop;
            if (this.props.position.value == null) {
                this.props.position.setValue(mutablePoint);
            }
            else {
                this.props.position.didChange.emit(mutablePoint);
            }
        };
        this.props.element.addEventListener("scroll", onScroll);
        onScroll();
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this.props.element.removeEventListener("scroll", onScroll);
            this.props.position.setValue(undefined);
        }));
    }
}
class ScrollWatcher extends skytree_1.ManagedObject {
    constructor(props) {
        super(props);
        this._position = observable_1.Observable.ofEmpty(geometry_1.Point2.isEqual);
        this.position = observable_1.ReadOnlyObservable.givenObservable(this._position);
        if (observable_1.Observable.isObservable(props.element)) {
            this._element = props.element;
        }
        else {
            this._element = observable_1.Observable.givenValue(props.element);
        }
    }
    onActivate() {
        this.cancelOnDeactivate(this._element.didChange.subscribe((element) => {
            if (this._activeWatcher != null) {
                this.removeManagedObject(this._activeWatcher);
                this._activeWatcher = undefined;
            }
            if (element != null) {
                this._activeWatcher = this.addManagedObject(new InternalScrollWatcher({
                    element,
                    position: this._position,
                }));
            }
        }, true));
    }
}
exports.ScrollWatcher = ScrollWatcher;
//# sourceMappingURL=index.js.map