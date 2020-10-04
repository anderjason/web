import { Actor } from "skytree";
import { Observable } from "@anderjason/observable";
export interface CheckboxBindingProps {
    inputElement: HTMLElement;
    initialValue?: boolean;
    shouldPreventChange?: (newValue: boolean) => boolean;
}
export declare class CheckboxBinding extends Actor<CheckboxBindingProps> {
    readonly isChecked: Observable<boolean>;
    readonly inputElement: HTMLInputElement;
    private _previousValue;
    constructor(props: CheckboxBindingProps);
    onActivate(): void;
}
