import { Actor } from "skytree";
import { ElementStyle, ScrollArea } from "../../../src";
import { Color } from "@anderjason/color";
import { Observable } from "@anderjason/observable";

export interface ScrollAreaDemoProps {}

export class ScrollAreaDemo extends Actor<ScrollAreaDemoProps> {
  readonly parentElement = Observable.ofEmpty<HTMLElement>();
  readonly isVisible = Observable.ofEmpty<boolean>();

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
  css: `
    width: 600px;
    height: 600px;
    background: linear-gradient(to bottom right, red, blue);
  `,
});
