import { Actor } from "skytree";
import { ElementStyle, KeyboardWatcher } from "../../../src";
import { Observable } from "@anderjason/observable";

export interface KeyboardWatcherDemoProps {}

export class KeyboardWatcherDemo extends Actor<KeyboardWatcherDemoProps> {
  readonly parentElement = Observable.ofEmpty<HTMLElement>();
  readonly isVisible = Observable.ofEmpty<boolean>();

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
  css: `
    padding: 40px;
    font-family: monospace;
    font-size: 1.5rem;
    color: #FFF;
    user-select: none;
  `,
});
