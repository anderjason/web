"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedElement = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
class ManagedElement extends skytree_1.ManagedObject {
    constructor(definition) {
        super();
        this.element = document.createElement(definition.tagName);
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
    initManagedObject() {
        this.addReceipt(this.parentElement.didChange.subscribe((parentElement) => {
            if (this.element.parentElement === parentElement) {
                return;
            }
            if (this.element.parentElement != null) {
                this.element.parentElement.removeChild(this.element);
            }
            if (parentElement != null) {
                parentElement.appendChild(this.element);
            }
        }, true));
        let classesChangedReceipt;
        const cleanup = () => {
            if (this.element.parentElement != null) {
                this.element.parentElement.removeChild(this.element);
            }
            classesChangedReceipt.cancel();
        };
        this.addReceipt(observable_1.Receipt.givenCancelFunction(() => {
            if (this._transitionOut == null) {
                cleanup();
            }
            else {
                this._transitionOut()
                    .then(cleanup)
                    .catch((err) => {
                    console.error(err);
                    cleanup();
                });
            }
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
        return this.addReceipt(observable_1.Receipt.givenCancelFunction(() => {
            this.element.removeEventListener(type, listener, options);
        }));
    }
}
exports.ManagedElement = ManagedElement;
//# sourceMappingURL=index.js.map