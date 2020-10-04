import { Actor } from "skytree";
import { Observable } from "@anderjason/observable";
export interface TextInputBindingProps<T> {
    inputElement: HTMLElement;
    displayTextGivenValue: (value: T) => string;
    valueGivenDisplayText: (displayText: string) => T;
    value?: Observable<T>;
    shouldPreventChange?: (displayText: string, value: T) => boolean;
}
export declare class TextInputBinding<T> extends Actor<TextInputBindingProps<T>> {
    readonly value: Observable<T>;
    private _shouldPreventChange;
    private _previousValue;
    private _caretPosition;
    private _inputElement;
    constructor(props: TextInputBindingProps<T>);
    onActivate(): void;
    private undoChange;
}
