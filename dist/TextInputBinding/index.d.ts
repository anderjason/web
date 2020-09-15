import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
export interface TextInputBindingDefinition {
    inputElement: HTMLElement;
    initialValue?: string;
    shouldPreventChange?: (newValue: string) => boolean;
}
export declare class TextInputBinding extends ManagedObject<TextInputBindingDefinition> {
    readonly text: Observable<string>;
    private _shouldPreventChange;
    private _previousValue;
    private _caretPosition;
    private _inputElement;
    constructor(props: TextInputBindingDefinition);
    onActivate(): void;
    private undoChange;
}
