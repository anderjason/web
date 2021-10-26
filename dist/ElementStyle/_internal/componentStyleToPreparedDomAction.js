"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.componentStyleToPreparedDomAction = void 0;
const defineCssClass_1 = require("./defineCssClass");
function componentStyleToPreparedDomAction(elementStyle) {
    (0, defineCssClass_1.defineCssClass)(elementStyle.toClassNames(), elementStyle.css);
    const modifiers = elementStyle.toOptionalModifiers();
    if (modifiers != null) {
        Object.keys(modifiers).forEach((modifierKey) => {
            const modifierCss = modifiers[modifierKey];
            const modifierClassNames = elementStyle.toClassNames(modifierKey);
            (0, defineCssClass_1.defineCssClass)(modifierClassNames, modifierCss);
        });
    }
}
exports.componentStyleToPreparedDomAction = componentStyleToPreparedDomAction;
//# sourceMappingURL=componentStyleToPreparedDomAction.js.map