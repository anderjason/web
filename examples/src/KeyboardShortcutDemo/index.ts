import { DemoActor } from "@anderjason/example-tools";
import { ElementStyle, KeyboardShortcut, KeyboardWatcher } from "../../../src";

export class KeyboardShortcutDemo extends DemoActor<void> {
  onActivate() {
    const label = this.addActor(
      LabelStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const label2 = this.addActor(
      LabelStyle.toManagedElement({
        tagName: "div",
        parentElement: this.parentElement,
      })
    );

    const shortcut1 = this.addActor(
      new KeyboardShortcut({
        keyCombination: ["Shift", "A"],
      })
    );

    this.cancelOnDeactivate(
      shortcut1.isPressed.didChange.subscribe((isPressed) => {
        label.element.innerHTML = isPressed ? "Shortcut 1 pressed" : "Shortcut 1 not pressed";
      }, true)
    );

    const shortcut2 = this.addActor(
      new KeyboardShortcut({
        keyCombination: ["Shift", "A"],
      })
    );

    this.cancelOnDeactivate(
      shortcut2.isPressed.didChange.subscribe((isPressed) => {
        label2.element.innerHTML = isPressed ? "Shortcut 2 pressed" : "Shortcut 2 not pressed";
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
