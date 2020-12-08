import { componentStyleToPreparedDomAction } from "./_internal/componentStyleToPreparedDomAction";
import { DynamicStyleElement } from "../DynamicStyleElement";
import { StringUtil } from "@anderjason/util";
import { Observable, Dict } from "@anderjason/observable";
import { Actor } from "skytree";

interface ElementStyleDefinition {
  css: string;

  elementDescription?: string;
  modifiers?: Dict<string>;
}

interface StyleToElementDefinition<K extends keyof HTMLElementTagNameMap> {
  tagName: K;
  parentElement?: HTMLElement | Observable<HTMLElement>;

  transitionIn?: (
    element: DynamicStyleElement<HTMLElementTagNameMap[K]>
  ) => void;

  transitionOut?: (
    element: DynamicStyleElement<HTMLElementTagNameMap[K]>
  ) => Promise<void>;

  innerHTML?: string;
}

export class ElementStyle {
  private static allClassNames = new Set<string>();

  static givenDefinition(definition: ElementStyleDefinition): ElementStyle {
    return new ElementStyle(definition);
  }

  readonly css: string;

  private _className: string;
  private _elementDescription: string;
  private _modifiers: Dict<string> | undefined;

  private constructor(definition: ElementStyleDefinition) {
    this.css = definition.css;
    this._modifiers = definition.modifiers;
    this._elementDescription = definition.elementDescription;

    const randomString = StringUtil.stringOfRandomCharacters(5).toLowerCase();

    if (this._elementDescription != null) {
      const classDescription = StringUtil.stringWithCase(
        this._elementDescription,
        "kebab-case"
      );
      this._className = `${classDescription}-${randomString}`;
    } else {
      this._className = `es-${randomString}`;
    }

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

  toCombinedClassName(modifierKeys?: string | string[]): string {
    return this.toClassNames(modifierKeys).join(" ");
  }

  toClassNames(modifierKeys?: string | string[]): string[] {
    const result = [this._className];

    if (modifierKeys != null) {
      if (Array.isArray(modifierKeys)) {
        modifierKeys.forEach((modifierKey) => {
          result.push(
            `${this._className}__${StringUtil.stringWithCase(
              modifierKey,
              "kebab-case"
            )}`
          );
        });
      } else {
        result.push(
          `${this._className}__${StringUtil.stringWithCase(
            modifierKeys,
            "kebab-case"
          )}`
        );
      }
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

    return Actor.withDescription(
      this._elementDescription,
      DynamicStyleElement.givenDefinition({
        tagName: definition.tagName,
        parentElement: definition.parentElement,
        transitionIn: definition.transitionIn,
        transitionOut: definition.transitionOut,
        innerHTML: definition.innerHTML,
        classNamesByModifierName,
        constantClassNames: this.toClassNames(),
      })
    );
  }
}
