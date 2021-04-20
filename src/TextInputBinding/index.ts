import { Actor } from "skytree";
import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { StringUtil } from "@anderjason/util";

export interface TextInputBindingOverrideResult {
  text: string;

  caretPosition?: number;
}

export interface TextInputBindingProps<T> {
  inputElement: HTMLElement;
  displayTextGivenValue: (value: T) => string;
  valueGivenDisplayText: (displayText: string) => T;

  value?: Observable<T>;
  overrideDisplayText?: (e: TextInputChangingData<T>) => string | TextInputBindingOverrideResult;
}

export interface TextInputChangingData<T> {
  displayText: string;
  value: T;
  previousDisplayText: string;
  previousValue: T;
  caretPosition: number;
}

export class TextInputBinding<T = string> extends Actor<
  TextInputBindingProps<T>
> {
  readonly output: Observable<T>;

  private _displayText = Observable.ofEmpty<string>(Observable.isStrictEqual);
  readonly displayText = ReadOnlyObservable.givenObservable(this._displayText);

  private _isEmpty = Observable.ofEmpty<boolean>(Observable.isStrictEqual);
  readonly isEmpty = ReadOnlyObservable.givenObservable(this._isEmpty);

  private _rawInputValue = Observable.ofEmpty<string>(Observable.isStrictEqual);
  readonly rawInputText = ReadOnlyObservable.givenObservable(
    this._rawInputValue
  );

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

    this.output =
      this.props.value || Observable.ofEmpty(Observable.isStrictEqual);
  }

  onActivate() {
    this._previousDisplayText = this._inputElement.value;

    this._inputElement.addEventListener("keydown", (e) => {
      this._previousDisplayText = this._inputElement.value;
      this._rawInputValue.setValue(this._inputElement.value);
      this._isEmpty.setValue(
        StringUtil.stringIsEmpty(this._inputElement.value)
      );
    });

    this._inputElement.addEventListener("input", (e: Event) => {
      const displayText = this._inputElement.value;
      let value = this.props.valueGivenDisplayText(displayText);

      let overrideResult: TextInputBindingOverrideResult;

      if (this.props.overrideDisplayText != null) {
        const actualOverrideResult: string | TextInputBindingOverrideResult = this.props.overrideDisplayText({
          displayText,
          value,
          previousDisplayText: this._previousDisplayText,
          previousValue: this.output.value,
          caretPosition: this._inputElement.selectionStart
        });

        if (typeof actualOverrideResult === "string") {
          overrideResult = {
            text: actualOverrideResult,
            caretPosition: undefined
          };
        } else {
          overrideResult = actualOverrideResult;
        }

        if (overrideResult == null) {
          this.onOverride(this._previousDisplayText, this._caretPosition);
          return;
        } else {
          this.onOverride(overrideResult.text, overrideResult.caretPosition);
          value = this.props.valueGivenDisplayText(overrideResult.text);
        }
      }

      this.output.setValue(value);

      if (overrideResult != null) {
        requestAnimationFrame(() => {
          this._inputElement.value = overrideResult.text;

          if (this._caretPosition != null) {
            if (this._inputElement == document.activeElement) {
              this._inputElement.setSelectionRange(this._caretPosition, this._caretPosition);
            }

            this._caretPosition = null;
        }

          this._rawInputValue.setValue(this._inputElement.value);
          this._isEmpty.setValue(
            StringUtil.stringIsEmpty(this._inputElement.value)
          );
        });
      }
    });

    this.cancelOnDeactivate(
      this.output.didChange.subscribe((value) => {
        const displayText = this.props.displayTextGivenValue(value);
        const startPos = this._inputElement.selectionStart;
        const endPos = this._inputElement.selectionEnd;
        this._inputElement.value = displayText || "";

        if (this._inputElement == document.activeElement) {
          this._inputElement.setSelectionRange(startPos, endPos);
        }

        this._rawInputValue.setValue(this._inputElement.value);
        this._isEmpty.setValue(
          StringUtil.stringIsEmpty(this._inputElement.value)
        );
      }, true)
    );
  }

  private onOverride(text: string, caretPosition?: number) {
    this._previousDisplayText = text;
    this._inputElement.value = text;

    if (caretPosition != null) {
      this._caretPosition = caretPosition;
      if (this._inputElement == document.activeElement) {
        this._inputElement.setSelectionRange(
          caretPosition,
          caretPosition
        );
      }
    }

    this._rawInputValue.setValue(text);
    this._isEmpty.setValue(StringUtil.stringIsEmpty(text));
  }
}
