"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollWatcher = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const geometry_1 = require("@anderjason/geometry");
const geometry_2 = require("@anderjason/geometry");
class ActiveScrollWatcher extends skytree_1.ManagedObject {
    constructor(element, position) {
        super();
        this._element = element;
        this._position = position;
    }
    initManagedObject() {
        const mutablePoint = geometry_2.MutablePoint2.ofZero();
        const onScroll = () => {
            mutablePoint.x = this._element.scrollLeft;
            mutablePoint.y = this._element.scrollTop;
            if (this._position.value == null) {
                this._position.setValue(mutablePoint);
            }
            else {
                this._position.didChange.emit(mutablePoint);
            }
        };
        this._element.addEventListener("scroll", onScroll);
        onScroll();
        this.addReceipt(observable_1.Receipt.givenCancelFunction(() => {
            this._element.removeEventListener("scroll", onScroll);
            this._position.setValue(undefined);
        }));
    }
}
class ScrollWatcher extends skytree_1.ManagedObject {
    constructor(element) {
        super();
        this.position = observable_1.Observable.ofEmpty(geometry_1.Point2.isEqual);
        this.element = element;
    }
    static ofEmpty() {
        return new ScrollWatcher(observable_1.Observable.ofEmpty());
    }
    static givenElement(element) {
        return new ScrollWatcher(observable_1.Observable.givenValue(element));
    }
    static givenObservableElement(element) {
        return new ScrollWatcher(element);
    }
    initManagedObject() {
        this.addReceipt(this.element.didChange.subscribe((element) => {
            if (this._activeWatcher != null) {
                this.removeManagedObject(this._activeWatcher);
                this._activeWatcher = undefined;
            }
            if (element != null) {
                this._activeWatcher = this.addManagedObject(new ActiveScrollWatcher(element, this.position));
            }
        }, true));
    }
}
exports.ScrollWatcher = ScrollWatcher;
//# sourceMappingURL=index.js.map