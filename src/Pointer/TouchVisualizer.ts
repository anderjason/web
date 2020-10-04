import { Actor } from "skytree";
import { Pointer } from ".";
import { ElementStyle } from "../ElementStyle";

export interface TouchVisualizerDefinition {
  touchSupport: Pointer;
}

export class TouchVisualizer extends Actor<TouchVisualizerDefinition> {
  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: document.body,
      })
    );
    wrapper.element.id = "TouchVisualizer";

    const point1 = this.addActor(
      PointStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );
    point1.style.backgroundColor = "red";

    const point2 = this.addActor(
      PointStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );
    point2.style.backgroundColor = "blue";

    this.cancelOnDeactivate(
      this.props.touchSupport.points.didChange.subscribe((points) => {
        if (points.first != null) {
          point1.style.transform = `translate(${points.first.x}px, ${points.first.y}px)`;
          point1.addModifier("isVisible");
        } else {
          point1.removeModifier("isVisible");
        }

        if (points.second != null) {
          point2.style.transform = `translate(${points.second.x}px, ${points.second.y}px)`;
          point2.addModifier("isVisible");
        } else {
          point2.removeModifier("isVisible");
        }
      })
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  css: `
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    pointer-events: none;
    user-select: none;
    z-index: 1000;
  `,
});

const PointStyle = ElementStyle.givenDefinition({
  css: `
    position: absolute;
    left: -17.5px;
    top: -17.5px;
    width: 35px;
    height: 35px;
    border-radius: 50%;
    background: rgba(255,255,255,0.9);
    box-shadow: 0 0 0 5px rgba(255,255,255,.35);
    display: none;
  `,
  modifiers: {
    isVisible: `
      display: block;
    `,
  },
});
