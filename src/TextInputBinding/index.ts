import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { StringUtil } from "@anderjason/util";

export interface TextInputBindingProps<T> {
  inputElement: HTMLElement;
  displayTextGivenValue: (value: T) => string;
  valueGivenDisplayText: (displayText: string) => T;

  value?: Observable<T>;
  overrideDisplayText?: (e: TextInputChangingData<T>) => string;
}

export interface TextInputChangingData<T> {
  displayText: string;
  value: T;
  previousDisplayText: string;
  previousValue: T;
}

export class TextInputBinding<T = string> extends Actor<
  TextInputBindingProps<T>
> {
  readonly value: Observable<T>;

  private _displayText = Observable.ofEmpty<string>(Observable.isStrictEqual);
  readonly displayText = ReadOnlyObservable.givenObservable(this._displayText);

  private _isEmpty = Observable.ofEmpty<boolean>(Observable.isStrictEqual);
  readonly isEmpty = ReadOnlyObservable.givenObservable(this._isEmpty);

  private _rawInputValue = Observable.ofEmpty<string>(Observable.isStrictEqual);
  readonly rawInputText = ReadOnlyObservable.givenObservable(
    this._rawInputValue
  );

  private _overrideDisplayText: (e: TextInputChangingData<T>) => string;
  private _previousDisplayText: string;
  private _caretPosition: number;
  private _inputElement: HTMLInputElement | HTMLTextAreaElement;

  constructor(props: TextInputBindingProps<T>) {
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

    this.value =
      this.props.value || Observable.ofEmpty(Observable.isStrictEqual);
  }

  onActivate() {
    this._previousDisplayText = this._inputElement.value;
    this._caretPosition = this._inputElement.selectionStart;

    this._inputElement.addEventListener("keydown", (e) => {
      this._caretPosition = this._inputElement.selectionStart;
      this._previousDisplayText = this._inputElement.value;
      this._rawInputValue.setValue(this._inputElement.value);
      this._isEmpty.setValue(
        StringUtil.stringIsEmpty(this._inputElement.value)
      );
    });

    this._inputElement.addEventListener("input", (e: Event) => {
      const displayText = this._inputElement.value;
      let value = this.props.valueGivenDisplayText(displayText);

      if (this.props.overrideDisplayText != null) {
        const overrideText = this.props.overrideDisplayText({
          displayText,
          value,
          previousDisplayText: this._previousDisplayText,
          previousValue: this.value.value,
        });
        if (overrideText == null) {
          this.onOverride(this._previousDisplayText, true);
          return;
        } else {
          this.onOverride(overrideText, false);
          value = this.props.valueGivenDisplayText(overrideText);
        }
      }

      this.value.setValue(value);
      this._rawInputValue.setValue(this._inputElement.value);
      this._isEmpty.setValue(
        StringUtil.stringIsEmpty(this._inputElement.value)
      );
    });

    this.cancelOnDeactivate(
      this.value.didChange.subscribe((value) => {
        const displayText = this.props.displayTextGivenValue(value);
        this._inputElement.value = displayText || "";

        this._rawInputValue.setValue(this._inputElement.value);
        this._isEmpty.setValue(
          StringUtil.stringIsEmpty(this._inputElement.value)
        );
      }, true)
    );
  }

  private onOverride(text: string, setCaretPosition: boolean) {
    this._previousDisplayText = text;
    this._inputElement.value = text;

    if (setCaretPosition) {
      this._inputElement.setSelectionRange(
        this._caretPosition,
        this._caretPosition
      );
    }

    this._rawInputValue.setValue(text);
    this._isEmpty.setValue(StringUtil.stringIsEmpty(text));
  }
}
