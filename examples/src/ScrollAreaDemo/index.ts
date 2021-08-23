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
    -webkit-mask-image: -webkit-radial-gradient(white, black);
    border-radius: 15px;
    color: white;
    height: 300px;
    left: 50%;
    overflow: hidden;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
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
