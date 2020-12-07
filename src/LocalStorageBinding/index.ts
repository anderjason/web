import { Observable } from "@anderjason/observable";
import { Actor } from "skytree";

export interface LocalStorageBindingProps {
  localStorageKey: string;

  value?: Observable<string>;
}

export class LocalStorageBinding extends Actor<LocalStorageBindingProps> {
  readonly observableValue: Observable<string>;

  constructor(props: LocalStorageBindingProps) {
    super(props);

    this.observableValue =
      this.props.value || Observable.ofEmpty<string>(Observable.isStrictEqual);
  }

  onActivate() {
    try {
      this.observableValue.setValue(
        window.localStorage.getItem(this.props.localStorageKey)
      );
    } catch (err) {
      console.warn(err);
    }

    this.cancelOnDeactivate(
      this.observableValue.didChange.subscribe((value) => {
        try {
          if (value != null) {
            window.localStorage.setItem(this.props.localStorageKey, value);
          } else {
            window.localStorage.removeItem(this.props.localStorageKey);
          }
        } catch (err) {
          console.warn(err);
        }
      }, true)
    );
  }
}
