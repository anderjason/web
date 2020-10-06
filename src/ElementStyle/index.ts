import { componentStyleToPreparedDomAction } from "./_internal/componentStyleToPreparedDomAction";
import { DynamicStyleElement } from "../DynamicStyleElement";
import { StringUtil } from "@anderjason/util";
import { Observable, Dict } from "@anderjason/observable";

interface ElementStyleDefinition {
  css: string;

  className?: string;
  modifiers?: Dict<string>;
}

interface StyleToElementDefinition<K extends keyof HTMLElementTagNameMap> {
  tagName: K;
  parentElement?: HTMLElement | Observable<HTMLElement>;

  transitionIn?: () => void;
  transitionOut?: () => Promise<void>;
}

export class ElementStyle {
  private static allClassNames = new Set<string>();

  static givenDefinition(definition: ElementStyleDefinition): ElementStyle {
    return new ElementStyle(definition);
  }

  readonly css: string;

  private _className: string;
  private _modifiers: Dict<string> | undefined;

  private constructor(definition: ElementStyleDefinition) {
    this.css = definition.css;
    this._modifiers = definition.modifiers;

    const randomString = StringUtil.stringOfRandomCharacters(6);

    this._className =
      definition.className != null
        ? definition.className
        : `es-${randomString}`;

    if (ElementStyle.allClassNames.has(this._className)) {
      throw new Error(
        `A style with class name '${this._className}' has already been created`
      );
    }

    ElementStyle.allClassNames.add(this._className);
    componentStyleToPreparedDomAction(this);
  }

  toOptionalModifiers(): Dict<string> | undefined {
    return this._modifiers;
  }

  toModifierKeys(): string[] {
    return Object.keys(this._modifiers || {});
  }

  toCombinedClassName(modifierKey?: string): string {
    return this.toClassNames(modifierKey).join(" ");
  }

  toClassNames(modifierKey?: string): string[] {
    const result = [this._className];

    if (modifierKey != null) {
      result.push(
        `${this._className}__${StringUtil.stringWithCase(
          modifierKey,
          "kebab-case"
        )}`
      );
    }

    return result;
  }

  toDomElement<K extends keyof HTMLElementTagNameMap>(
    tagName: K
  ): HTMLElementTagNameMap[K] {
    const element = document.createElement(tagName);
    element.className = this.toCombinedClassName();
    return element;
  }

  toManagedElement<K extends keyof HTMLElementTagNameMap>(
    definition: StyleToElementDefinition<K>
  ): DynamicStyleElement<HTMLElementTagNameMap[K]> {
    const classNamesByModifierName = new Map<string, string[]>();

    this.toModifierKeys().forEach((modifierName) => {
      const classNames = this.toClassNames(modifierName);

      classNamesByModifierName.set(modifierName, classNames);
    });

    return DynamicStyleElement.givenDefinition({
      tagName: definition.tagName,
      parentElement: definition.parentElement,
      transitionIn: definition.transitionIn,
      transitionOut: definition.transitionOut,
      classNamesByModifierName,
      constantClassNames: this.toClassNames(),
    });
  }
}
