import { Observable } from "@anderjason/observable";
import { Duration } from "@anderjason/time";
import { ElementStyle } from "../../../src";
import { Actor, Timer } from "skytree";

export interface TransitionDemoProps {}

export class TransitionDemo extends Actor<TransitionDemoProps> {
  readonly parentElement = Observable.ofEmpty<HTMLElement>();
  readonly isVisible = Observable.ofEmpty<boolean>();

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
  css: `
    
  `,
});

const WrapperStyle = ElementStyle.givenDefinition({
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
