import { DynamicStyleElement } from "../DynamicStyleElement";
import { Observable, Dict } from "@anderjason/observable";
interface ElementStyleDefinition {
    css: string;
    className?: string;
    modifiers?: Dict<string>;
}
interface StyleToElementDefinition<K extends keyof HTMLElementTagNameMap> {
    tagName: K;
    parentElement?: HTMLElement | Observable<HTMLElement>;
    transitionOut?: () => Promise<void>;
}
export declare class ElementStyle {
    private static allClassNames;
    static givenDefinition(definition: ElementStyleDefinition): ElementStyle;
    readonly css: string;
    private _className;
    private _modifiers;
    private constructor();
    toOptionalModifiers(): Dict<string> | undefined;
    toModifierKeys(): string[];
    toCombinedClassName(modifierKey?: string): string;
    toClassNames(modifierKey?: string): string[];
    toDomElement<K extends keyof HTMLElementTagNameMap>(tagName: K): HTMLElementTagNameMap[K];
    toManagedElement<K extends keyof HTMLElementTagNameMap>(definition: StyleToElementDefinition<K>): DynamicStyleElement<HTMLElementTagNameMap[K]>;
}
export {};
