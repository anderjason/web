"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementMountWatcher = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
class ElementMountWatcher extends skytree_1.Actor {
    constructor() {
        super(...arguments);
        this._isElementMounted = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.isElementMounted = observable_1.ReadOnlyObservable.givenObservable(this._isElementMounted);
    }
    static watchAllOnce() {
        if (ElementMountWatcher._isWatching == true) {
            return;
        }
        ElementMountWatcher._isWatching = true;
        const mutationObserver = new MutationObserver((mutationsList, observer) => {
            for (let watcher of this.watcherByElement.values()) {
                const isMounted = watcher.props.element.offsetParent != null;
                watcher._isElementMounted.setValue(isMounted);
            }
        });
        mutationObserver.observe(document.body, {
            childList: true,
            subtree: true,
        });
    }
    onActivate() {
        ElementMountWatcher.watcherByElement.set(this.props.element, this);
        ElementMountWatcher.watchAllOnce();
        this._isElementMounted.setValue(this.props.element.offsetParent != null);
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            ElementMountWatcher.watcherByElement.delete(this.props.element);
        }));
    }
}
exports.ElementMountWatcher = ElementMountWatcher;
ElementMountWatcher.watcherByElement = new Map();
ElementMountWatcher._isWatching = false;
//# sourceMappingURL=index.js.map