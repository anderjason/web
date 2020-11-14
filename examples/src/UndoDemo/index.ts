import { Observable, Receipt } from "@anderjason/observable";
import { ElementStyle, UndoContext } from "../../../src";
import { Actor, MultiBinding } from "skytree";
import { Point2 } from "@anderjason/geometry";

export interface UndoDemoProps {}

export class UndoDemo extends Actor<UndoDemoProps> {
  readonly parentElement = Observable.ofEmpty<HTMLElement>();
  readonly isVisible = Observable.ofEmpty<boolean>();

  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const indicator = this.addActor(
      IndicatorStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );

    const buttonsArea = this.addActor(
      ButtonAreaStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const sidebar = this.addActor(
      SidebarStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const undoButton = this.addActor(
      ButtonStyle.toManagedElement({
        tagName: "button",
        parentElement: buttonsArea.element,
      })
    );
    undoButton.element.innerHTML = "Undo";

    const redoButton = this.addActor(
      ButtonStyle.toManagedElement({
        tagName: "button",
        parentElement: buttonsArea.element,
      })
    );
    redoButton.element.innerHTML = "Redo";

    const clearAndKeepButton = this.addActor(
      ButtonStyle.toManagedElement({
        tagName: "button",
        parentElement: buttonsArea.element,
      })
    );
    clearAndKeepButton.element.innerHTML = "Clear and keep current";

    const clearAllButton = this.addActor(
      ButtonStyle.toManagedElement({
        tagName: "button",
        parentElement: buttonsArea.element,
      })
    );
    clearAllButton.element.innerHTML = "Clear all";

    const undoContext = new UndoContext<Point2>(undefined, 10);

    undoContext.currentIndex.didChange.subscribe(() => {
      const steps = undoContext.steps.toValues();

      sidebar.element.innerHTML = "";

      const currentIndex = undoContext.currentIndex.value;
      steps.forEach((step, idx) => {
        const div = document.createElement("div");
        div.innerHTML = `${step.x},${step.y}`;
        if (idx === currentIndex) {
          div.style.fontWeight = "bold";
          div.style.color = "#FFF";
        }
        sidebar.element.appendChild(div);
      });

      clearAllButton.setModifier("isDisabled", steps.length === 0);
      clearAndKeepButton.setModifier("isDisabled", steps.length < 2);
    }, true);

    this.cancelOnDeactivate(
      undoContext.canUndo.didChange.subscribe((canUndo) => {
        undoButton.setModifier("isDisabled", canUndo == false);
      }, true)
    );

    this.cancelOnDeactivate(
      undoContext.canRedo.didChange.subscribe((canRedo) => {
        redoButton.setModifier("isDisabled", canRedo == false);
      }, true)
    );

    this.cancelOnDeactivate(
      clearAndKeepButton.addManagedEventListener("click", () => {
        undoContext.clearSteps("keepCurrent");
      })
    );

    this.cancelOnDeactivate(
      clearAllButton.addManagedEventListener("click", () => {
        undoContext.clearSteps("clearAll");
      })
    );

    this.cancelOnDeactivate(
      undoButton.addManagedEventListener("click", () => {
        undoContext.undo();
      })
    );

    this.cancelOnDeactivate(
      redoButton.addManagedEventListener("click", () => {
        undoContext.redo();
      })
    );

    this.cancelOnDeactivate(
      undoContext.output.didChange.subscribe((point) => {
        if (point == null) {
          indicator.style.display = "none";
          return;
        }

        indicator.style.display = "block";
        indicator.style.transform = `translate(${point.x}px, ${point.y}px)`;
      }, true)
    );

    const onClick = (e: MouseEvent) => {
      const bounds = wrapper.element.getBoundingClientRect();

      undoContext.pushStep(
        Point2.givenXY(
          Math.round(e.clientX - bounds.left),
          Math.round(e.clientY - bounds.top)
        )
      );
    };

    wrapper.element.addEventListener("click", onClick);

    this.cancelOnDeactivate(
      new Receipt(() => {
        wrapper.element.removeEventListener("click", onClick);
      })
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

const IndicatorStyle = ElementStyle.givenDefinition({
  elementDescription: "Indicator",
  css: `
    position: absolute;
    left: -10px;
    top: -10px;
    width: 20px;
    height: 20px;
    border-radius: 50%;
    background: blue;
  `,
});

const ButtonStyle = ElementStyle.givenDefinition({
  elementDescription: "Button",
  css: `
    appearance: none;
    background: blue;
    border: none;
    color: #FFF;
    border-radius: 6px;
    padding: 10px 20px;
    outline: none;
    transition: 0.1s ease transform;
    user-select: none;

    &:active {
      transform: scale(0.95);
    }
  `,
  modifiers: {
    isDisabled: `
      opacity: 0.3;
      pointer-events: none;
    `,
  },
});

const ButtonAreaStyle = ElementStyle.givenDefinition({
  elementDescription: "ButtonArea",
  css: `
    display: grid;
    position: absolute;
    grid-template-columns: auto auto;
    grid-gap: 0.5rem;
    bottom: 20px;
    left: 20px;
  `,
});

const SidebarStyle = ElementStyle.givenDefinition({
  elementDescription: "Sidebar",
  css: `
    position: absolute;
    right: 20px;
    top: 20px;
    bottom: 20px;
    text-align: right;
    font-family: monospace;
    color: #888;
    user-select: none;
  `,
});
