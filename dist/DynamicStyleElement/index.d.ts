import { Actor } from "skytree";
import { Observable, Receipt } from "@anderjason/observable";
import { ManagedElement } from "../ManagedElement";
export interface DynamicStyleElementDefinition<K extends keyof HTMLElementTagNameMap> {
    tagName: K;
    parentElement?: HTMLElement | Observable<HTMLElement>;
    classNamesByModifierName?: Map<string, string[]>;
    constantClassNames?: string[];
    transitionIn?: (element: DynamicStyleElement<HTMLElementTagNameMap[K]>) => void;
    transitionOut?: (element: DynamicStyleElement<HTMLElementTagNameMap[K]>) => Promise<void>;
    innerHTML?: string;
}
export declare class DynamicStyleElement<T extends HTMLElement> extends Actor {
    readonly parentElement: Observable<HTMLElement>;
    readonly tagName: keyof HTMLElementTagNameMap;
    static givenDefinition<K extends keyof HTMLElementTagNameMap>(definition: DynamicStyleElementDefinition<K>): DynamicStyleElement<HTMLElementTagNameMap[K]>;
    private _classNamesByModifierName;
    private _managedElement;
    private _modifiers;
    private _constantClassNames;
    private _transitionIn?;
    private _transitionOut?;
    private _innerHTML?;
    private constructor();
    get element(): T;
    get style(): CSSStyleDeclaration;
    get managedElement(): ManagedElement<T>;
    onActivate(): void;
    addManagedEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): Receipt;
    toggleModifier(modifierName: string): void;
    setModifier(modifierName: string, isActive: boolean): void;
    hasModifier(modifierName: string): boolean;
    toModifiers(): string[];
    private activeClassNames;
    private updateClassNames;
}
