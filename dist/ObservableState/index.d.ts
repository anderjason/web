import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { ValuePath } from "@anderjason/util";
import { UndoContext } from "../UndoContext";
import { Actor } from "skytree";
import { ObservableStateBinding } from "./_internal/ObservableStateBinding";
export interface ObservableStateProps {
    initialState?: any;
}
export interface ObservableStateBindingDefinition<T> {
    valuePath: ValuePath;
    output?: Observable<T>;
    partialStateGivenOutputValue?: (outputValue: T) => any;
    outputValueGivenPartialState?: (partialState: any) => T;
}
export declare class ObservableState extends Actor<ObservableStateProps> {
    private _state;
    readonly state: ReadOnlyObservable<unknown>;
    private _undoContext;
    onActivate(): void;
    get undoContext(): UndoContext;
    pushCurrentState(): void;
    toBinding<T>(definition: ObservableStateBindingDefinition<T>): ObservableStateBinding<T>;
    toOptionalValueGivenPath(path: ValuePath): any;
    private onRequestUpdate;
}
