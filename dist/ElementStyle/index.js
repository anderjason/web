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
        const randomString = util_1.StringUtil.stringOfRandomCharacters(6);
        this._className =
            definition.className != null
                ? definition.className
                : `es-${randomString}`;
        if (ElementStyle.allClassNames.has(this._className)) {
            throw new Error(`A style with class name '${this._className}' has already been created`);
        }
        ElementStyle.allClassNames.add(this._className);
        componentStyleToPreparedDomAction_1.componentStyleToPreparedDomAction(this);
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
    toCombinedClassName(modifierKey) {
        return this.toClassNames(modifierKey).join(" ");
    }
    toClassNames(modifierKey) {
        const result = [this._className];
        if (modifierKey != null) {
            result.push(`${this._className}__${util_1.StringUtil.stringWithCase(modifierKey, "kebab-case")}`);
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
            transitionOut: definition.transitionOut,
            classNamesByModifierName,
            constantClassNames: this.toClassNames(),
        });
    }
}
exports.ElementStyle = ElementStyle;
ElementStyle.allClassNames = new Set();
//# sourceMappingURL=index.js.map