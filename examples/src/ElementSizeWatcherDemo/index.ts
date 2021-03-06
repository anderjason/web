import { DemoActor } from "@anderjason/example-tools";
import { Duration } from "@anderjason/time";
import { ConditionalActivator, Timer } from "skytree";
import { ElementSizeWatcher, ElementStyle } from "../../../src";

export class ElementSizeWatcherDemo extends DemoActor<void> {
  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const bounds = this.addActor(
      BoundsStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
        transitionIn: () => {
          bounds.toggleModifier("isSmall");
        },
      })
    );

    const boundsWatcher = this.addActor(
      new ElementSizeWatcher({
        element: bounds.element,
      })
    );

    this.addActor(
      new ConditionalActivator({
        input: this.isVisible,
        fn: (v) => v,
        actor: new Timer({
          duration: Duration.givenSeconds(1.5),
          isRepeating: true,
          fn: () => {
            bounds.toggleModifier("isSmall");
          },
        }),
      })
    );

    this.cancelOnDeactivate(
      boundsWatcher.output.didChange.subscribe((b) => {
        if (b == null) {
          return;
        }

        const { width, height } = b;
        bounds.element.innerHTML = `${Math.round(width)}px ${Math.round(
          height
        )}px`;
      }, true)
    );
  }
}

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

const BoundsStyle = ElementStyle.givenDefinition({
  elementDescription: "Bounds",
  css: `
    background: #0055FF;
    position: absolute;
    display: flex;
    align-items: center;
    justify-content: center;
    color: white;
    width: 240px;
    height: 200px;
    transition: 1s ease all;
    border-radius: 8px;
    font-family: monospace;
    user-select: none;
  `,
  modifiers: {
    isSmall: `
      width: 350px;
      height: 100px;
    `,
  },
});
