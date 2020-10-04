import { Actor } from "skytree";
import { Observable, Receipt } from "@anderjason/observable";
import { ManagedElement } from "../ManagedElement";
export interface DynamicStyleElementDefinition<K extends keyof HTMLElementTagNameMap> {
    tagName: K;
    parentElement?: HTMLElement | Observable<HTMLElement>;
    classNamesByModifierName?: Map<string, string[]>;
    constantClassNames?: string[];
    transitionOut?: () => Promise<void>;
}
export declare class DynamicStyleElement<T extends HTMLElement> extends Actor {
    readonly parentElement: Observable<HTMLElement>;
    readonly tagName: keyof HTMLElementTagNameMap;
    static givenDefinition<K extends keyof HTMLElementTagNameMap>(definition: DynamicStyleElementDefinition<K>): DynamicStyleElement<HTMLElementTagNameMap[K]>;
    private _classNamesByModifierName;
    private _managedElement;
    private _modifiers;
    private _constantClassNames;
    private _transitionOut?;
    private constructor();
    get element(): T | undefined;
    get style(): CSSStyleDeclaration;
    get managedElement(): ManagedElement<T> | undefined;
    onActivate(): void;
    addManagedEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): Receipt;
    addModifier(modifierName: string): void;
    removeModifier(modifierName: string): void;
    toggleModifier(modifierName: string): void;
    setModifier(modifierName: string, isActive: boolean): void;
    toModifiers(): string[];
    private activeClassNames;
    private updateClassNames;
}
