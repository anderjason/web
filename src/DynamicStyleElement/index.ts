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

  transitionIn?: (
    element: DynamicStyleElement<HTMLElementTagNameMap[K]>
  ) => void;

  transitionOut?: (
    element: DynamicStyleElement<HTMLElementTagNameMap[K]>
  ) => Promise<void>;

  innerHTML?: string;
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
  private _transitionIn?: (element: DynamicStyleElement<T>) => void;
  private _transitionOut?: (element: DynamicStyleElement<T>) => Promise<void>;
  private _innerHTML?: string;

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
    this._innerHTML = definition.innerHTML;
    this._transitionIn = definition.transitionIn;
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
        innerHTML: this._innerHTML,
        transitionIn: () => {
          if (this._transitionIn != null) {
            this._transitionIn(this);
          }
        },
        transitionOut: async () => {
          if (this._transitionOut != null) {
            await this._transitionOut(this);
          }
        },
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

  toggleModifier(modifierName: string): void {
    this.setModifier(modifierName, !this._modifiers.has(modifierName));
  }

  setModifier(modifierName: string, isActive: boolean): void {
    if (isActive) {
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
    } else {
      if (!this._modifiers.has(modifierName)) {
        return;
      }

      this._modifiers.delete(modifierName);
      this.updateClassNames();
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
