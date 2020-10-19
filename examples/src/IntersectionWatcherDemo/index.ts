import { Color } from "@anderjason/color";
import { Observable, ObservableArray } from "@anderjason/observable";
import { ElementStyle, ScrollArea } from "@anderjason/web";
import { Actor, ArrayActivator } from "skytree";
import { ActiveBox } from "./ActiveBox";

export interface IntersectionWatcherDemoProps {}

export class IntersectionWatcherDemo extends Actor<
  IntersectionWatcherDemoProps
> {
  readonly parentElement = Observable.ofEmpty<HTMLElement>();
  readonly isVisible = Observable.ofEmpty<boolean>();

  onActivate() {
    const wrapper = this.addActor(
      new ScrollArea({
        parentElement: this.parentElement,
        direction: "vertical",
        scrollPositionColor: Color.givenHexString("#FFFFFF"),
      })
    );

    const el = ObservableArray.givenValues([1, 2, 3, 4, 5, 6]);

    this.addActor(
      new ArrayActivator({
        input: el,
        fn: () => {
          return new ActiveBox({
            parentElement: wrapper.element,
          });
        },
      })
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  css: `
    background: #333;
    position: absolute;
    width: 300px;
    height: 300px;
    transform: translate(-50%, -50%);
    left: 50%;
    top: 50%;
    color: white;
    overflow-y: scroll;
  `,
});
