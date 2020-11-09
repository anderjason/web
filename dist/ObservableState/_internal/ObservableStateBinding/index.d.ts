import { Observable } from "@anderjason/observable";
import { ValuePath } from "@anderjason/util";
import { Actor } from "skytree";
import { ObservableState } from "../..";
export interface ObservableStateBindingProps<T> {
    observableState: ObservableState;
    valuePath: ValuePath;
    onRequestUpdate: (valuePath: ValuePath, value: any) => boolean;
    output?: Observable<T>;
    partialStateGivenOutputValue?: (outputValue: T) => any;
    outputValueGivenPartialState?: (partialState: any) => T;
}
export declare class ObservableStateBinding<T> extends Actor<ObservableStateBindingProps<T>> {
    readonly output: Observable<T>;
    constructor(props: ObservableStateBindingProps<T>);
    onActivate(): void;
}
