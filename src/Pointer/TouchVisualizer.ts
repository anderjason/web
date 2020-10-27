import { Actor } from "skytree";
import { Pointer } from ".";
import { ElementStyle } from "../ElementStyle";

export interface TouchVisualizerProps {
  touchSupport: Pointer;
}

export class TouchVisualizer extends Actor<TouchVisualizerProps> {
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
          point1.setModifier("isVisible", true);
        } else {
          point1.setModifier("isVisible", false);
        }

        if (points.second != null) {
          point2.style.transform = `translate(${points.second.x}px, ${points.second.y}px)`;
          point2.setModifier("isVisible", true);
        } else {
          point2.setModifier("isVisible", false);
        }
      })
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  css: `
    bottom: 0;
    left: 0;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    user-select: none;
    z-index: 1000;
  `,
});

const PointStyle = ElementStyle.givenDefinition({
  css: `
    background: rgba(255,255,255,0.9);
    border-radius: 50%;
    box-shadow: 0 0 0 5px rgba(255,255,255,.35);
    display: none;
    height: 35px;
    left: -17.5px;
    position: absolute;
    top: -17.5px;
    width: 35px;
  `,
  modifiers: {
    isVisible: `
      display: block;
    `,
  },
});
