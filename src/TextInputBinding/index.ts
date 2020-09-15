import { ManagedObject } from "skytree";
import { Observable } from "@anderjason/observable";

export interface TextInputBindingDefinition {
  inputElement: HTMLElement;

  initialValue?: string;
  shouldPreventChange?: (newValue: string) => boolean;
}

const allowAll = () => false;

export class TextInputBinding extends ManagedObject<
  TextInputBindingDefinition
> {
  readonly text: Observable<string>;

  private _shouldPreventChange: (newValue: string) => boolean;
  private _previousValue: string;
  private _caretPosition: number;
  private _inputElement: HTMLInputElement | HTMLTextAreaElement;

  constructor(props: TextInputBindingDefinition) {
    super(props);

    if (props.inputElement == null) {
      throw new Error("Input is required");
    }

    const nodeName = props.inputElement.nodeName.toLowerCase();
    if (nodeName !== "input" && nodeName !== "textarea") {
      throw new Error(
        `Expected an input or textarea element, but got '${nodeName}'`
      );
    }

    this._inputElement = props.inputElement as HTMLInputElement;
    this.text = Observable.givenValue(
      props.initialValue || "",
      Observable.isStrictEqual
    );

    this._shouldPreventChange = props.shouldPreventChange || allowAll;
  }

  onActivate() {
    this._previousValue = this._inputElement.value;
    this._caretPosition = this._inputElement.selectionStart;

    this._inputElement.addEventListener("keydown", (e) => {
      this._caretPosition = this._inputElement.selectionStart;
    });

    this._inputElement.addEventListener("input", (e: Event) => {
      const newValue = this._inputElement.value;

      if (this._shouldPreventChange(newValue)) {
        this.undoChange();
        return;
      }

      this.text.setValue(newValue);
      this._previousValue = newValue;
    });

    this.cancelOnDeactivate(
      this.text.didChange.subscribe((value) => {
        this._inputElement.value = value;
      }, true)
    );
  }

  private undoChange() {
    this._inputElement.value = this._previousValue;
    this._inputElement.setSelectionRange(
      this._caretPosition,
      this._caretPosition
    );
  }
}
