import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
export interface TextInputBindingProps {
    inputElement: HTMLElement;
    initialValue?: string;
    shouldPreventChange?: (newValue: string) => boolean;
}
export declare class TextInputBinding extends ManagedObject<TextInputBindingProps> {
    readonly text: Observable<string>;
    private _shouldPreventChange;
    private _previousValue;
    private _caretPosition;
    private _inputElement;
    constructor(props: TextInputBindingProps);
    onActivate(): void;
    private undoChange;
}
