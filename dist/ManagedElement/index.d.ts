import { ManagedObject } from "skytree";
import { Receipt, Observable, ObservableSet } from "@anderjason/observable";
export interface ManagedElementDefinition<K extends keyof HTMLElementTagNameMap> {
    tagName: K;
    parentElement?: HTMLElement | Observable<HTMLElement>;
    classNames?: string[] | ObservableSet<string>;
    transitionOut?: () => Promise<void>;
}
export declare class ManagedElement<T extends HTMLElement> extends ManagedObject {
    readonly element: T;
    readonly parentElement: Observable<HTMLElement>;
    readonly classes: ObservableSet<string>;
    static givenDefinition<K extends keyof HTMLElementTagNameMap>(definition: ManagedElementDefinition<K>): ManagedElement<HTMLElementTagNameMap[K]>;
    private _transitionOut?;
    private constructor();
    get style(): CSSStyleDeclaration;
    initManagedObject(): void;
    addManagedEventListener<K extends keyof HTMLElementEventMap>(type: K, listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any, options?: boolean | AddEventListenerOptions): Receipt;
}
