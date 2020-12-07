import { Observable } from "@anderjason/observable";
import { Actor } from "skytree";
export interface LocalStorageBindingProps {
    localStorageKey: string;
    value?: Observable<string>;
}
export declare class LocalStorageBinding extends Actor<LocalStorageBindingProps> {
    readonly observableValue: Observable<string>;
    constructor(props: LocalStorageBindingProps);
    onActivate(): void;
}
