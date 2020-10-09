import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
export interface TextInputBindingProps<T> {
    inputElement: HTMLElement;
    displayTextGivenValue: (value: T) => string;
    valueGivenDisplayText: (displayText: string) => T;
    value?: Observable<T>;
    overrideDisplayText?: (e: TextInputChangingData<T>) => string;
}
export interface TextInputChangingData<T> {
    displayText: string;
    value: T;
    previousDisplayText: string;
    previousValue: T;
}
export declare class TextInputBinding<T = string> extends Actor<TextInputBindingProps<T>> {
    readonly value: Observable<T>;
    private _displayText;
    readonly displayText: ReadOnlyObservable<string>;
    private _isEmpty;
    readonly isEmpty: ReadOnlyObservable<boolean>;
    private _rawInputValue;
    readonly rawInputText: ReadOnlyObservable<string>;
    private _overrideDisplayText;
    private _previousDisplayText;
    private _caretPosition;
    private _inputElement;
    constructor(props: TextInputBindingProps<T>);
    onActivate(): void;
    private onOverride;
}
