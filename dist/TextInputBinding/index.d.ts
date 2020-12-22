import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
export interface TextInputBindingOverrideResult {
    text: string;
    caretPosition?: number;
}
export interface TextInputBindingProps<T> {
    inputElement: HTMLElement;
    displayTextGivenValue: (value: T) => string;
    valueGivenDisplayText: (displayText: string) => T;
    value?: Observable<T>;
    overrideDisplayText?: (e: TextInputChangingData<T>) => string | TextInputBindingOverrideResult;
}
export interface TextInputChangingData<T> {
    displayText: string;
    value: T;
    previousDisplayText: string;
    previousValue: T;
    caretPosition: number;
}
export declare class TextInputBinding<T = string> extends Actor<TextInputBindingProps<T>> {
    readonly output: Observable<T>;
    private _displayText;
    readonly displayText: ReadOnlyObservable<string>;
    private _isEmpty;
    readonly isEmpty: ReadOnlyObservable<boolean>;
    private _rawInputValue;
    readonly rawInputText: ReadOnlyObservable<string>;
    private _previousDisplayText;
    private _caretPosition;
    private _inputElement;
    constructor(props: TextInputBindingProps<T>);
    onActivate(): void;
    private onOverride;
}
