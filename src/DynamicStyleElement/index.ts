import { Actor } from "skytree";
import { Observable, Receipt } from "@anderjason/observable";
import { ManagedElement } from "../ManagedElement";

export interface DynamicStyleElementDefinition<
  K extends keyof HTMLElementTagNameMap
> {
  tagName: K;

  parentElement?: HTMLElement | Observable<HTMLElement>;
  classNamesByModifierName?: Map<string, string[]>;
  constantClassNames?: string[];
  transitionOut?: () => Promise<void>;
}

export class DynamicStyleElement<T extends HTMLElement> extends Actor {
  readonly parentElement: Observable<HTMLElement>;
  readonly tagName: keyof HTMLElementTagNameMap;

  static givenDefinition<K extends keyof HTMLElementTagNameMap>(
    definition: DynamicStyleElementDefinition<K>
  ): DynamicStyleElement<HTMLElementTagNameMap[K]> {
    return new DynamicStyleElement(definition);
  }

  private _classNamesByModifierName: Map<string, string[]>;
  private _managedElement: ManagedElement<T>;
  private _modifiers = new Set<string>();
  private _constantClassNames: string[];
  private _transitionOut?: () => Promise<void>;

  private constructor(definition: DynamicStyleElementDefinition<any>) {
    super({});

    if (definition.parentElement == null) {
      this.parentElement = Observable.ofEmpty();
    } else if (Observable.isObservable(definition.parentElement)) {
      this.parentElement = definition.parentElement;
    } else {
      this.parentElement = Observable.givenValue(definition.parentElement);
    }

    this.tagName = definition.tagName;
    this._transitionOut = definition.transitionOut;
    this._classNamesByModifierName =
      definition.classNamesByModifierName || new Map();
    this._constantClassNames = definition.constantClassNames || [];
  }

  get element(): T | undefined {
    const managed = this.managedElement;
    if (managed == null) {
      return undefined;
    }

    return managed.element;
  }

  get style(): CSSStyleDeclaration {
    return this.element.style;
  }

  get managedElement(): ManagedElement<T> | undefined {
    return this._managedElement;
  }

  onActivate() {
    this._managedElement = this.addActor(
      ManagedElement.givenDefinition({
        tagName: this.tagName,
        parentElement: this.parentElement,
        transitionOut: this._transitionOut,
      }) as ManagedElement<any>
    );

    this.updateClassNames();
  }

  addManagedEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): Receipt {
    return this.managedElement.addManagedEventListener(type, listener, options);
  }

  addModifier(modifierName: string): void {
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

  removeModifier(modifierName: string): void {
    if (!this._modifiers.has(modifierName)) {
      return;
    }

    this._modifiers.delete(modifierName);
    this.updateClassNames();
  }

  toggleModifier(modifierName: string): void {
    if (this._modifiers.has(modifierName)) {
      this.removeModifier(modifierName);
    } else {
      this.addModifier(modifierName);
    }
  }

  setModifier(modifierName: string, isActive: boolean): void {
    if (isActive) {
      this.addModifier(modifierName);
    } else {
      this.removeModifier(modifierName);
    }
  }

  toModifiers(): string[] {
    return Array.from(this._modifiers);
  }

  private activeClassNames(): Set<string> {
    const result = new Set<string>();

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

  private updateClassNames(): void {
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
