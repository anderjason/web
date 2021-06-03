import { Observable, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { ValuePath } from "@anderjason/util";
import { UndoContext } from "../UndoContext";
import { Actor } from "skytree";
import { ObservableStateBinding } from "./_internal/ObservableStateBinding";
export interface ObservableStateProps {
    initialState?: any;
}
export interface ObservableStateChange {
    valuePath: ValuePath;
    oldValue: any;
    newValue: any;
}
export interface ObservableStateBindingDefinition<T> {
    valuePath: ValuePath<T>;
    output?: Observable<T>;
    partialStateGivenOutputValue?: (outputValue: T) => any;
    outputValueGivenPartialState?: (partialState: any) => T;
}
export declare class ObservableState extends Actor<ObservableStateProps> {
    private _state;
    readonly state: ReadOnlyObservable<unknown>;
    private _undoContext;
    readonly willChange: TypedEvent<ObservableStateChange>;
    onActivate(): void;
    get undoContext(): UndoContext;
    pushCurrentState(): void;
    toBinding<T>(definition: ObservableStateBindingDefinition<T>): ObservableStateBinding<T>;
    toOptionalValueGivenPath<T>(path: ValuePath<T>): T;
    update(path: string | string[] | ValuePath, inputValue: any): boolean;
}
