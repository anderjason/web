import { Color } from "@anderjason/color";
import { DemoActor } from "@anderjason/example-tools";
import { Observable } from "@anderjason/observable";
import { ElementStyle, ManagedElement, ScrollArea, TextInputBinding } from "../../../src";

export class TextInputBindingDemo extends DemoActor<void> {
  onActivate() {
    const outer = this.addActor(
      OuterStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const input = this.addActor(
      ManagedElement.givenDefinition({
        tagName: "input",
        parentElement: outer.element,
      })
    );
    input.element.type = "text";

    this.addActor(
      new TextInputBinding<string>({
        inputElement: input.element,
        value: Observable.givenValue("initial value"),
        displayTextGivenValue: (v) => v,
        valueGivenDisplayText: (v) => v,
      })
    );    
  }
}

const OuterStyle = ElementStyle.givenDefinition({
  elementDescription: "Outer",
  css: `
    padding: 20px;
  `,
});

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    width: 600px;
    height: 600px;
    background: linear-gradient(to bottom right, red, blue);
  `,
});
