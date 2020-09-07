"use strict";
/// <reference path="./defineCssClass.d.ts" />
Object.defineProperty(exports, "__esModule", { value: true });
exports.defineCssClass = void 0;
const stylis_1 = require("stylis");
let styleElement;
if (typeof document !== "undefined") {
    styleElement = document.createElement("style");
    styleElement.type = "text/css";
    document.head.appendChild(styleElement);
}
function defineCssClass(classNames, css) {
    if (typeof document === "undefined") {
        return;
    }
    const modifiedClassName = classNames.map((name) => `.${name}`).join("");
    const styleContent = stylis_1.serialize(stylis_1.compile(`${modifiedClassName}{${css}}`), stylis_1.stringify);
    if (styleElement != null) {
        styleElement.appendChild(document.createTextNode(styleContent));
    }
}
exports.defineCssClass = defineCssClass;
//# sourceMappingURL=defineCssClass.js.map