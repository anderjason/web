import { DemoActor } from "@anderjason/example-tools";
import { ElementStyle, KeyboardWatcher } from "../../../src";

export class KeyboardWatcherDemo extends DemoActor<void> {
  onActivate() {
    const label = this.addActor(
      LabelStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    this.cancelOnDeactivate(
      KeyboardWatcher.instance.keys.didChange.subscribe((keys) => {
        if (keys == null || keys.length == 0) {
          label.element.innerHTML = "No keys pressed";
          return;
        }

        label.element.innerHTML = "";
        keys.forEach((key) => {
          const div = document.createElement("div");
          div.innerHTML = key;
          label.element.appendChild(div);
        });
      }, true)
    );
  }
}

const LabelStyle = ElementStyle.givenDefinition({
  elementDescription: "Label",
  css: `
    color: #FFF;
    font-family: monospace;
    font-size: 1.5rem;
    padding: 40px;
    user-select: none;
  `,
});
