import { Color } from "@anderjason/color";
import { DemoActor } from "@anderjason/example-tools";
import { Duration } from "@anderjason/time";
import { Timer } from "skytree";
import { ElementStyle, ManagedElement, ScrollArea, SequentialChoice } from "../../../src";

export class ScrollAreaAnchorDemo extends DemoActor<void> {
  onActivate() {
    const outer = this.addActor(
      OuterStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const scrollArea = this.addActor(
      new ScrollArea({
        parentElement: outer.element,
        direction: "vertical",
        scrollPositionColor: Color.givenHexString("#000000"),
        anchorBottom: true
      })
    );

    this.cancelOnDeactivate(
      scrollArea.contentSize.didChange.subscribe(contentSize => {
        const height = Math.min(150, contentSize.height);
        outer.style.height = `${height}px`;
      }, true)
    )

    const content = this.addActor(
      ContentStyle.toManagedElement({
        tagName: "div",
        parentElement: scrollArea.element,
      })
    );

    const textDiv = this.addActor(
      ManagedElement.givenDefinition({
        tagName: "div",
        parentElement: content.element
      })
    );

    this.addActor(
      ButtonStyle.toManagedElement({
        tagName: "div",
        parentElement: content.element,
        innerHTML: "Button"
      })
    );

    const options = new SequentialChoice({
      options: [
        "Lorem ipsum",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation",
        "Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum."
      ]
    });

    this.addActor(
      new Timer({
        duration: Duration.givenSeconds(3),
        isRepeating: true,
        fn: () => {
          options.selectNextOption();
        }
      })
    );

    this.cancelOnDeactivate(
      options.currentOption.didChange.subscribe(text => {
        textDiv.element.innerHTML = text;
      }, true)
    );
  }
}

const OuterStyle = ElementStyle.givenDefinition({
  elementDescription: "Outer",
  css: `
    color: white;
    height: 300px;
    left: 50%;
    position: absolute;
    top: 50%;
    transform: translate(-50%, -50%);
    width: 300px;
    background: #FAFAFA;
    box-sizing: border-box;
    border-radius: 8px;
  `,
});

const ContentStyle = ElementStyle.givenDefinition({
  elementDescription: "Content",
  css: `
    color: #222;
    margin: 20px;
  `
});

const ButtonStyle = ElementStyle.givenDefinition({
  elementDescription: "Button",
  css: `
    align-items: center;
    background: blue;
    border-radius: 8px;
    color: #FFF;
    display: flex;
    height: 30px;
    justify-content: center;
    margin-top: 10px;
    width: 100%;
  `
});
