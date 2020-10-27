import { Actor } from "skytree";
import { Observable } from "@anderjason/observable";

export interface CheckboxBindingProps {
  inputElement: HTMLElement;

  initialValue?: boolean;
  shouldPreventChange?: (newValue: boolean) => boolean;
}

const allowAll = () => false;

export class CheckboxBinding extends Actor<CheckboxBindingProps> {
  readonly output: Observable<boolean>;
  readonly inputElement: HTMLInputElement;

  private _previousValue: boolean;

  constructor(props: CheckboxBindingProps) {
    super(props);

    if (props.inputElement == null) {
      throw new Error("Input element is required");
    }

    const nodeName = props.inputElement.nodeName.toLowerCase();
    if (nodeName !== "input") {
      throw new Error(`Expected an input element, but got '${nodeName}'`);
    }

    this.inputElement = props.inputElement as HTMLInputElement;
    if (this.inputElement.type !== "checkbox") {
      throw new Error(`Expected an input with type "checkbox"`);
    }

    this.output = Observable.givenValue(
      props.initialValue || false,
      Observable.isStrictEqual
    );
  }

  onActivate() {
    this._previousValue = this.inputElement.checked;

    this.inputElement.addEventListener("input", (e: Event) => {
      const newValue = this.inputElement.checked;

      const shouldPreventChange = this.props.shouldPreventChange || allowAll;
      if (shouldPreventChange(newValue)) {
        this.inputElement.checked = this._previousValue;
        return;
      }

      this.output.setValue(newValue);
      this._previousValue = newValue;
    });

    this.cancelOnDeactivate(
      this.output.didChange.subscribe((value) => {
        this.inputElement.checked = value;
      }, true)
    );
  }
}
