import { DynamicStyleElement } from "../DynamicStyleElement";
import { Observable, Dict } from "@anderjason/observable";
interface ElementStyleDefinition {
    css: string;
    elementDescription?: string;
    modifiers?: Dict<string>;
}
interface StyleToElementDefinition<K extends keyof HTMLElementTagNameMap> {
    tagName: K;
    parentElement?: HTMLElement | Observable<HTMLElement>;
    transitionIn?: (element: DynamicStyleElement<HTMLElementTagNameMap[K]>) => void;
    transitionOut?: (element: DynamicStyleElement<HTMLElementTagNameMap[K]>) => Promise<void>;
    innerHTML?: string;
}
export declare class ElementStyle {
    private static allClassNames;
    static givenDefinition(definition: ElementStyleDefinition): ElementStyle;
    readonly css: string;
    private _className;
    private _elementDescription;
    private _modifiers;
    private constructor();
    toOptionalModifiers(): Dict<string> | undefined;
    toModifierKeys(): string[];
    toCombinedClassName(modifierKeys?: string | string[]): string;
    toClassNames(modifierKeys?: string | string[]): string[];
    toDomElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    toManagedElement<K extends keyof HTMLElementTagNameMap>(definition: StyleToElementDefinition<K>): DynamicStyleElement<HTMLElementTagNameMap[K]>;
}
export {};
