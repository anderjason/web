import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";
export interface CheckboxBindingDefinition {
    input: HTMLElement;
    initialValue?: boolean;
    shouldPreventChange?: (newValue: boolean) => boolean;
}
export declare class CheckboxBinding extends ManagedObject {
    static givenDefinition(definition: CheckboxBindingDefinition): CheckboxBinding;
    readonly isChecked: Observable<boolean>;
    readonly input: HTMLInputElement;
    private _shouldPreventChange;
    private _previousValue;
    private constructor();
    initManagedObject(): void;
    private undoChange;
}
