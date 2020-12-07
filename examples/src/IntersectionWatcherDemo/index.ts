import { Color } from "@anderjason/color";
import { DemoActor } from "@anderjason/example-tools";
import { ObservableArray } from "@anderjason/observable";
import { ArrayActivator } from "skytree";
import { ScrollArea } from "../../../src";
import { ActiveBox } from "./ActiveBox";

export class IntersectionWatcherDemo extends DemoActor<void> {
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
