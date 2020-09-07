import { defineCssClass } from "./defineCssClass";
import { ElementStyle } from "..";

export function componentStyleToPreparedDomAction(
  elementStyle: ElementStyle
): void {
  defineCssClass(elementStyle.toClassNames(), elementStyle.css);

  const modifiers = elementStyle.toOptionalModifiers();
  if (modifiers != null) {
    Object.keys(modifiers).forEach((modifierKey) => {
      const modifierCss = modifiers[modifierKey];
      const modifierClassNames = elementStyle.toClassNames(modifierKey);

      defineCssClass(modifierClassNames, modifierCss);
    });
  }
}
