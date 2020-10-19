"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.IntersectionWatcher = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class InternalIntersectionWatcher extends skytree_1.Actor {
    onActivate() {
        const threshold = this.props.minimumVisiblePercent.toNumber(1);
        const observer = new IntersectionObserver((elements) => {
            const element = elements[0];
            if (element == null) {
                return;
            }
            this.props.isElementVisible.setValue(element.isIntersecting == true);
        }, {
            root: this.props.scrollElement || this.props.element.parentElement,
            rootMargin: this.props.rootMargin,
            threshold,
        });
        observer.observe(this.props.element);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            observer.disconnect();
            this.props.isElementVisible.setValue(undefined);
        }));
    }
}
class IntersectionWatcher extends skytree_1.Actor {
    constructor(props) {
        super(props);
        if (observable_1.Observable.isObservable(props.element)) {
            this._element = props.element;
        }
        else {
            this._element = observable_1.Observable.givenValue(props.element);
        }
        this._isElementVisible =
            props.isElementVisible ||
                observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.isElementVisible = observable_1.ReadOnlyObservable.givenObservable(this._isElementVisible);
    }
    onActivate() {
        this.cancelOnDeactivate(this._element.didChange.subscribe((element) => {
            if (this._activeWatcher != null) {
                this.removeActor(this._activeWatcher);
                this._activeWatcher = undefined;
            }
            if (element != null) {
                this._activeWatcher = this.addActor(new InternalIntersectionWatcher({
                    element,
                    minimumVisiblePercent: this.props.minimumVisiblePercent,
                    isElementVisible: this._isElementVisible,
                    rootMargin: this.props.rootMargin,
                    scrollElement: this.props.scrollElement,
                }));
            }
        }, true));
    }
}
exports.IntersectionWatcher = IntersectionWatcher;
//# sourceMappingURL=index.js.map