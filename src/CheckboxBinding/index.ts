import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";

export interface CheckboxBindingDefinition {
  input: HTMLElement;

  initialValue?: boolean;
  shouldPreventChange?: (newValue: boolean) => boolean;
}

const allowAll = () => false;

export class CheckboxBinding extends ManagedObject {
  static givenDefinition(
    definition: CheckboxBindingDefinition
  ): CheckboxBinding {
    return new CheckboxBinding(definition);
  }

  readonly isChecked: Observable<boolean>;
  readonly input: HTMLInputElement;

  private _shouldPreventChange: (newValue: boolean) => boolean;
  private _previousValue: boolean;

  private constructor(definition: CheckboxBindingDefinition) {
    super();

    if (definition.input == null) {
      throw new Error("Input is required");
    }

    const nodeName = definition.input.nodeName.toLowerCase();
    if (nodeName !== "input") {
      throw new Error(`Expected an input element, but got '${nodeName}'`);
    }

    this.input = definition.input as HTMLInputElement;
    if (this.input.type !== "checkbox") {
      throw new Error(`Expected an input with type "checkbox"`);
    }

    this.isChecked = Observable.givenValue(
      definition.initialValue || false,
      Observable.isStrictEqual
    );

    this._shouldPreventChange = definition.shouldPreventChange || allowAll;
  }

  initManagedObject() {
    this._previousValue = this.input.checked;

    this.input.addEventListener("input", (e: Event) => {
      const newValue = this.input.checked;

      if (this._shouldPreventChange(newValue)) {
        this.undoChange();
        return;
      }

      this.isChecked.setValue(newValue);
      this._previousValue = newValue;
    });

    this.addReceipt(
      this.isChecked.didChange.subscribe((value) => {
        this.input.checked = value;
      }, true)
    );
  }

  private undoChange() {
    this.input.checked = this._previousValue;
  }
}
