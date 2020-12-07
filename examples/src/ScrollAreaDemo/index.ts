import { Color } from "@anderjason/color";
import { DemoActor } from "@anderjason/example-tools";
import { ElementStyle, ScrollArea } from "../../../src";

export class ScrollAreaDemo extends DemoActor<void> {
  onActivate() {
    const outer = this.addActor(
      OuterStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const scrollArea = this.addActor(
      new ScrollArea({
        parentElement: outer.element,
        direction: "both",
        scrollPositionColor: Color.givenHexString("#FFFFFF"),
      })
    );

    this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: scrollArea.element,
      })
    );
  }
}

const OuterStyle = ElementStyle.givenDefinition({
  elementDescription: "Outer",
  css: `
    position: absolute;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    color: white;
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
