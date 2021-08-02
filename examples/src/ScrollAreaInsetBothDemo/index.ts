import { Color } from "@anderjason/color";
import { DemoActor } from "@anderjason/example-tools";
import { Observable } from "@anderjason/observable";
import { Duration } from "@anderjason/time";
import { Timer } from "skytree";
import { ElementStyle, ScrollArea } from "../../../src";
import { ContentArea } from "../../../src/ScrollArea";

export class ScrollAreaInsetBothDemo extends DemoActor<void> {
  onActivate() {
    const outer = this.addActor(
      OuterStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const contentArea = Observable.givenValue<ContentArea>("inset");
    this.addActor(
      new Timer({
        duration: Duration.givenSeconds(3),
        isRepeating: true,
        fn: () => {
          contentArea.setValue(contentArea.value == "inset" ? "full" : "inset");
        }
      })
    );

    const scrollArea = this.addActor(
      new ScrollArea({
        parentElement: outer.element,
        direction: "both",
        scrollPositionColor: Color.givenHexString("#FFFFFF"),
        contentArea,
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
    background: #333;
    color: white;
    height: 300px;
    left: 50%;
    overflow: hidden;
    position: absolute;
    top: 50%;
    border-radius: 15px;
    transform: translate(-50%, -50%);
    width: 300px;
  `,
});

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    width: 600px;
    height: 600px;
    border-radius: 15px;
    border: 2px solid red;
    box-sizing: border-box;
    background: linear-gradient(to bottom right, red, blue);
  `,
});
