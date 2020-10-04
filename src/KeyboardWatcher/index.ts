import { Actor } from "skytree";
import {
  ObservableSet,
  ReadOnlyObservableSet,
  Receipt,
} from "@anderjason/observable";

export class KeyboardWatcher extends Actor<void> {
  private static _instance: KeyboardWatcher;

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

    this._keys.addValue(e.key);
  };

  private onKeyUp = (e: KeyboardEvent) => {
    this._keys.removeValue(e.key);
  };
}
