import { Actor } from "skytree";
import {
  ObservableSet,
  ReadOnlyObservableSet,
  Receipt,
} from "@anderjason/observable";

export class KeyboardWatcher extends Actor<void> {
  private static _instance: KeyboardWatcher;

  static controlKey = "Control";
  static altKey = "Alt";
  static shiftKey = "Shift";

  static get instance(): KeyboardWatcher {
    if (KeyboardWatcher._instance == null) {
      KeyboardWatcher._instance = new KeyboardWatcher();
      KeyboardWatcher._instance.activate();
    }

    return this._instance;
  }

  private _keys = ObservableSet.ofEmpty<string>();
  readonly keys = ReadOnlyObservableSet.givenObservableSet(this._keys);

  private constructor() {
    super();
  }

  onActivate() {
    if (typeof window === "undefined") {
      return;
    }
  
    window.addEventListener("keydown", this.onKeyDown);
    window.addEventListener("keyup", this.onKeyUp);

    this.cancelOnDeactivate(
      new Receipt(() => {
        window.removeEventListener("keydown", this.onKeyDown);
        window.removeEventListener("keyup", this.onKeyUp);
      })
    );
  }

  private onKeyDown = (e: KeyboardEvent) => {
    if (e.repeat == true) {
      return;
    }

    let key = e.key;

    if (key.length === 1) {
      key = key.toLowerCase();
    }

    this._keys.addValue(key);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    let key = e.key;

    if (key.length === 1) {
      key = key.toLowerCase();
    }

    this._keys.removeValue(key);
  };
}
