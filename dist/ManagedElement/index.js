"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedElement = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const ElementMountWatcher_1 = require("../ElementMountWatcher");
class ManagedElement extends skytree_1.Actor {
    constructor(definition) {
        super({});
        this.element = document.createElement(definition.tagName);
        if (definition.innerHTML != null) {
            this.element.innerHTML = definition.innerHTML;
        }
        this._transitionIn = definition.transitionIn;
        this._transitionOut = definition.transitionOut;
        if (definition.classNames == null) {
            this.classes = observable_1.ObservableSet.ofEmpty();
        }
        else if (Array.isArray(definition.classNames)) {
            this.classes = observable_1.ObservableSet.givenValues(definition.classNames);
        }
        else {
            this.classes = definition.classNames;
        }
        if (definition.parentElement == null) {
            this.parentElement = observable_1.Observable.ofEmpty();
        }
        else if (observable_1.Observable.isObservable(definition.parentElement)) {
            this.parentElement = definition.parentElement;
        }
        else {
            this.parentElement = observable_1.Observable.givenValue(definition.parentElement, observable_1.Observable.isStrictEqual);
        }
    }
    static givenDefinition(definition) {
        return new ManagedElement(definition);
    }
    get style() {
        return this.element.style;
    }
    onActivate() {
        this.element.className = this.classes.toArray().join(" ");
        this.cancelOnDeactivate(this.parentElement.didChange.subscribe(async (parentElement) => {
            if (this.element.parentElement === parentElement) {
                return;
            }
            if (this.element.parentElement != null) {
                if (this._transitionOut != null) {
                    await this._transitionOut(this);
                }
                this.element.parentElement.removeChild(this.element);
            }
            if (parentElement != null) {
                parentElement.appendChild(this.element);
            }
        }, true));
        if (this._transitionIn != null || this._transitionOut != null) {
            this.watchDomVisibility();
        }
        let classesChangedReceipt;
        this.cancelOnDeactivate(new observable_1.Receipt(async () => {
            if (this._transitionOut != null) {
                try {
                    await this._transitionOut(this);
                }
                catch (err) {
                    console.error(err);
                }
            }
            if (this.element.parentElement != null) {
                this.element.parentElement.removeChild(this.element);
            }
            classesChangedReceipt.cancel();
        }));
        classesChangedReceipt = this.classes.didChangeSteps.subscribe((changes) => {
            if (changes == null) {
                return;
            }
            changes.forEach((change) => {
                switch (change.type) {
                    case "add":
                        this.element.classList.add(change.value);
                        break;
                    case "remove":
                        this.element.classList.remove(change.value);
                        break;
                }
            });
        });
    }
    addManagedEventListener(type, listener, options) {
        this.element.addEventListener(type, listener, options);
        return this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this.element.removeEventListener(type, listener, options);
        }));
    }
    watchDomVisibility() {
        const elementMountWatcher = this.addActor(new ElementMountWatcher_1.ElementMountWatcher({
            element: this.element,
        }));
        this.cancelOnDeactivate(elementMountWatcher.isElementMounted.didChange.subscribe((isMounted) => {
            requestAnimationFrame(() => {
                if (this.isActive == false) {
                    return;
                }
                try {
                    if (isMounted) {
                        if (this._transitionIn != null) {
                            this._transitionIn(this);
                        }
                    }
                    else {
                        // it's too late at this point for any transition out to
                        // be visible, because the element has already been removed
                        // from the DOM, but it's still important to run the function
                        // because the element may need to transition in again later
                        // so it needs a chance to update its state
                        if (this._transitionOut != null) {
                            this._transitionOut(this).catch((err) => {
                                console.warn(err);
                            });
                        }
                    }
                }
                catch (err) {
                    console.warn(err);
                }
            });
        }, true));
    }
}
exports.ManagedElement = ManagedElement;
//# sourceMappingURL=index.js.map