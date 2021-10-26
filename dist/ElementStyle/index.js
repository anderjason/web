"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ElementStyle = void 0;
const componentStyleToPreparedDomAction_1 = require("./_internal/componentStyleToPreparedDomAction");
const DynamicStyleElement_1 = require("../DynamicStyleElement");
const util_1 = require("@anderjason/util");
class ElementStyle {
    constructor(definition) {
        this.css = definition.css;
        this._modifiers = definition.modifiers;
        this._elementDescription = definition.elementDescription;
        const randomString = util_1.StringUtil.stringOfRandomCharacters(5).toLowerCase();
        if (this._elementDescription != null) {
            const classDescription = util_1.StringUtil.stringWithCase(this._elementDescription, "kebab-case");
            this._className = `${classDescription}-${randomString}`;
        }
        else {
            this._className = `es-${randomString}`;
        }
        if (ElementStyle.allClassNames.has(this._className)) {
            throw new Error(`A style with class name '${this._className}' has already been created`);
        }
        ElementStyle.allClassNames.add(this._className);
        (0, componentStyleToPreparedDomAction_1.componentStyleToPreparedDomAction)(this);
    }
    static givenDefinition(definition) {
        return new ElementStyle(definition);
    }
    toOptionalModifiers() {
        return this._modifiers;
    }
    toModifierKeys() {
        return Object.keys(this._modifiers || {});
    }
    toCombinedClassName(modifierKeys) {
        return this.toClassNames(modifierKeys).join(" ");
    }
    toClassNames(modifierKeys) {
        const result = [this._className];
        if (modifierKeys != null) {
            if (Array.isArray(modifierKeys)) {
                modifierKeys.forEach((modifierKey) => {
                    result.push(`${this._className}__${util_1.StringUtil.stringWithCase(modifierKey, "kebab-case")}`);
                });
            }
            else {
                result.push(`${this._className}__${util_1.StringUtil.stringWithCase(modifierKeys, "kebab-case")}`);
            }
        }
        return result;
    }
    toDomElement(tagName) {
        const element = document.createElement(tagName);
        element.className = this.toCombinedClassName();
        return element;
    }
    toManagedElement(definition) {
        const classNamesByModifierName = new Map();
        this.toModifierKeys().forEach((modifierName) => {
            const classNames = this.toClassNames(modifierName);
            classNamesByModifierName.set(modifierName, classNames);
        });
        return DynamicStyleElement_1.DynamicStyleElement.givenDefinition({
            tagName: definition.tagName,
            parentElement: definition.parentElement,
            transitionIn: definition.transitionIn,
            transitionOut: definition.transitionOut,
            innerHTML: definition.innerHTML,
            classNamesByModifierName,
            constantClassNames: this.toClassNames(),
        });
    }
}
exports.ElementStyle = ElementStyle;
ElementStyle.allClassNames = new Set();
//# sourceMappingURL=index.js.map