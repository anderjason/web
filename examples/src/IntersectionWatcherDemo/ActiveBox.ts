import { Actor } from "skytree";
import { ElementStyle, IntersectionWatcher } from "../../../src";
import { Percent } from "@anderjason/util";

export interface ActiveBoxProps {
  parentElement: HTMLElement;
}

export class ActiveBox extends Actor<ActiveBoxProps> {
  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.props.parentElement,
      })
    );

    const intersectionWatcher = this.addActor(
      new IntersectionWatcher({
        element: wrapper.element,
        minimumVisiblePercent: Percent.givenFraction(3, 5),
      })
    );

    this.cancelOnDeactivate(
      intersectionWatcher.isElementVisible.didChange.subscribe(
        (isElementVisible) => {
          wrapper.setModifier("isVisible", isElementVisible == true);
        },
        true
      )
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  css: `
    width: 250px;
    height: 250px;
    margin: 25px;
    background: rgba(255,255,255,0.1);
    transition: 0.2s ease background;
  `,
  modifiers: {
    isVisible: `
      background: #0055FF;
    `,
  },
});
