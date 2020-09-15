import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
export interface CheckboxBindingDefinition {
    inputElement: HTMLElement;
    initialValue?: boolean;
    shouldPreventChange?: (newValue: boolean) => boolean;
}
export declare class CheckboxBinding extends ManagedObject<CheckboxBindingDefinition> {
    readonly isChecked: Observable<boolean>;
    readonly inputElement: HTMLInputElement;
    private _previousValue;
    constructor(props: CheckboxBindingDefinition);
    onActivate(): void;
}
