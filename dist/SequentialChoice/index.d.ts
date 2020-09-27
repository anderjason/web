import { Observable, ReadOnlyObservable } from "@anderjason/observable";
export interface SequentialChoiceDefinition<T> {
    options: T[];
    output?: Observable<T>;
}
export declare class SequentialChoice<T> {
    readonly currentOption: Observable<T>;
    private _nextOption;
    readonly nextOption: ReadOnlyObservable<T>;
    private _previousOption;
    readonly previousOption: ReadOnlyObservable<T>;
    private _currentIdx;
    private props;
    constructor(props: SequentialChoiceDefinition<T>);
    private setCurrentIndex;
    selectNextOption: () => void;
    selectPreviousOption: () => void;
}
