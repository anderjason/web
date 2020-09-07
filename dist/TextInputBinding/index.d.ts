import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
export interface TextInputBindingDefinition {
    input: HTMLElement;
    initialValue?: string;
    shouldPreventChange?: (newValue: string) => boolean;
}
export declare class TextInputBinding extends ManagedObject {
    static givenDefinition(definition: TextInputBindingDefinition): TextInputBinding;
    readonly text: Observable<string>;
    readonly input: HTMLInputElement | HTMLTextAreaElement;
    private _shouldPreventChange;
    private _previousValue;
    private _caretPosition;
    private constructor();
    initManagedObject(): void;
    private undoChange;
}
