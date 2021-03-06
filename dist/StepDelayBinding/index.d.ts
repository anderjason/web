import { Observable, ObservableBase, ReadOnlyObservable } from "@anderjason/observable";
import { Actor } from "skytree";
export interface StepDelayBindingProps<T> {
    input: ObservableBase<T>;
    stepsBehind: number;
    output?: Observable<T>;
}
export declare class StepDelayBinding<T> extends Actor<StepDelayBindingProps<T>> {
    private _output;
    readonly output: ReadOnlyObservable<T>;
    constructor(props: StepDelayBindingProps<T>);
    onActivate(): void;
}
