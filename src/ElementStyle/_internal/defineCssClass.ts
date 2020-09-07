/// <reference path="./defineCssClass.d.ts" />

import { compile, serialize, stringify } from "stylis";

let styleElement: HTMLStyleElement;

if (typeof document !== "undefined") {
  styleElement = document.createElement("style");
  styleElement.type = "text/css";
  document.head.appendChild(styleElement);
}

export function defineCssClass(classNames: string[], css: string): void {
  if (typeof document === "undefined") {
    return;
  }

  const modifiedClassName = classNames.map((name) => `.${name}`).join("");

  const styleContent = serialize(
    compile(`${modifiedClassName}{${css}}`),
    stringify
  );

  if (styleElement != null) {
    styleElement.appendChild(document.createTextNode(styleContent));
  }
}
