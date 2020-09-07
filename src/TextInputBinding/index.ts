import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";

export interface TextInputBindingDefinition {
  input: HTMLElement;

  initialValue?: string;
  shouldPreventChange?: (newValue: string) => boolean;
}

const allowAll = () => false;

export class TextInputBinding extends ManagedObject {
  static givenDefinition(
    definition: TextInputBindingDefinition
  ): TextInputBinding {
    return new TextInputBinding(definition);
  }

  readonly text: Observable<string>;
  readonly input: HTMLInputElement | HTMLTextAreaElement;

  private _shouldPreventChange: (newValue: string) => boolean;
  private _previousValue: string;
  private _caretPosition: number;

  private constructor(definition: TextInputBindingDefinition) {
    super();

    if (definition.input == null) {
      throw new Error("Input is required");
    }

    const nodeName = definition.input.nodeName.toLowerCase();
    if (nodeName !== "input" && nodeName !== "textarea") {
      throw new Error(
        `Expected an input or textarea element, but got '${nodeName}'`
      );
    }

    this.input = definition.input as HTMLInputElement;
    this.text = Observable.givenValue(
      definition.initialValue || "",
      Observable.isStrictEqual
    );

    this._shouldPreventChange = definition.shouldPreventChange || allowAll;
  }

  initManagedObject() {
    this._previousValue = this.input.value;
    this._caretPosition = this.input.selectionStart;

    this.input.addEventListener("keydown", (e) => {
      this._caretPosition = this.input.selectionStart;
    });

    this.input.addEventListener("input", (e: Event) => {
      const newValue = this.input.value;

      if (this._shouldPreventChange(newValue)) {
        this.undoChange();
        return;
      }

      this.text.setValue(newValue);
      this._previousValue = newValue;
    });

    this.addReceipt(
      this.text.didChange.subscribe((value) => {
        this.input.value = value;
      }, true)
    );
  }

  private undoChange() {
    this.input.value = this._previousValue;
    this.input.setSelectionRange(this._caretPosition, this._caretPosition);
  }
}
