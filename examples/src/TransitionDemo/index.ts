import { Observable } from "@anderjason/observable";
import { Duration } from "@anderjason/time";
import { ElementStyle } from "../../../src";
import { Actor, Timer } from "skytree";
import { DemoActor } from "@anderjason/example-tools";

export class TransitionDemo extends DemoActor<void> {
  onActivate() {
    const outer = this.addActor(
      OuterStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const wrapperParent = Observable.ofEmpty<HTMLElement>();

    this.addActor(
      new Timer({
        duration: Duration.givenSeconds(2),
        isRepeating: true,
        fn: () => {
          if (wrapperParent.value == null) {
            wrapperParent.setValue(outer.element);
          } else {
            wrapperParent.setValue(undefined);
          }
        },
      })
    );

    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapperParent,
      })
    );

    const circle = this.addActor(
      CircleStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
        transitionIn: () => {
          circle.setModifier("isVisible", true);
        },
        transitionOut: async () => {
          circle.setModifier("isVisible", false);
          await Duration.givenSeconds(0.5).toDelay();
        },
      })
    );
  }
}

const OuterStyle = ElementStyle.givenDefinition({
  elementDescription: "Outer",
  css: `
    
  `,
});

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    top: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  `,
});

const CircleStyle = ElementStyle.givenDefinition({
  elementDescription: "Circle",
  css: `
    border-radius: 50%;
    background: white;
    width: 80px;
    height: 80px;
    transform: scale(0.1);
    transition: 0.5s ease transform;
  `,
  modifiers: {
    isVisible: `
      transform: scale(1);
    `,
  },
});
