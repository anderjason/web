"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DynamicStyleElement = void 0;
const skytree_1 = require("skytree");
const observable_1 = require("@anderjason/observable");
const ManagedElement_1 = require("../ManagedElement");
class DynamicStyleElement extends skytree_1.ManagedObject {
    constructor(definition) {
        super({});
        this._modifiers = new Set();
        if (definition.parentElement == null) {
            this.parentElement = observable_1.Observable.ofEmpty();
        }
        else if (observable_1.Observable.isObservable(definition.parentElement)) {
            this.parentElement = definition.parentElement;
        }
        else {
            this.parentElement = observable_1.Observable.givenValue(definition.parentElement);
        }
        this.tagName = definition.tagName;
        this._transitionOut = definition.transitionOut;
        this._classNamesByModifierName =
            definition.classNamesByModifierName || new Map();
        this._constantClassNames = definition.constantClassNames || [];
    }
    static givenDefinition(definition) {
        return new DynamicStyleElement(definition);
    }
    get element() {
        const managed = this.managedElement;
        if (managed == null) {
            return undefined;
        }
        return managed.element;
    }
    get style() {
        return this.element.style;
    }
    get managedElement() {
        return this._managedElement;
    }
    initManagedObject() {
        this._managedElement = this.addManagedObject(ManagedElement_1.ManagedElement.givenDefinition({
            tagName: this.tagName,
            parentElement: this.parentElement,
            transitionOut: this._transitionOut,
        }));
        this.updateClassNames();
    }
    addManagedEventListener(type, listener, options) {
        return this.managedElement.addManagedEventListener(type, listener, options);
    }
    addModifier(modifierName) {
        if (this._modifiers.has(modifierName)) {
            return;
        }
        this._modifiers.add(modifierName);
        const classNames = this._classNamesByModifierName.get(modifierName);
        if (classNames != null) {
            classNames.forEach((name) => {
                this.managedElement.classes.addValue(name);
            });
        }
    }
    removeModifier(modifierName) {
        if (!this._modifiers.has(modifierName)) {
            return;
        }
        this._modifiers.delete(modifierName);
        this.updateClassNames();
    }
    toggleModifier(modifierName) {
        if (this._modifiers.has(modifierName)) {
            this.removeModifier(modifierName);
        }
        else {
            this.addModifier(modifierName);
        }
    }
    setModifier(modifierName, isActive) {
        if (isActive) {
            this.addModifier(modifierName);
        }
        else {
            this.removeModifier(modifierName);
        }
    }
    toModifiers() {
        return Array.from(this._modifiers);
    }
    activeClassNames() {
        const result = new Set();
        this._modifiers.forEach((modifierName) => {
            const classNames = this._classNamesByModifierName.get(modifierName);
            if (classNames != null) {
                classNames.forEach((name) => {
                    result.add(name);
                });
            }
        });
        this._constantClassNames.forEach((className) => {
            result.add(className);
        });
        return result;
    }
    updateClassNames() {
        const activeClassNames = this.activeClassNames();
        this._managedElement.classes.toArray().forEach((className) => {
            if (!activeClassNames.has(className)) {
                this._managedElement.classes.removeValue(className);
            }
        });
        activeClassNames.forEach((className) => {
            this._managedElement.classes.addValue(className);
        });
    }
}
exports.DynamicStyleElement = DynamicStyleElement;
//# sourceMappingURL=index.js.map