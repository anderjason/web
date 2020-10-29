import {
  Observable,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { Actor } from "skytree";

export interface ElementMountWatcherProps {
  element: HTMLElement;
}

export class ElementMountWatcher extends Actor<ElementMountWatcherProps> {
  private static watcherByElement = new Map<HTMLElement, ElementMountWatcher>();
  private static _isWatching = false;

  private static watchAllOnce(): void {
    if (ElementMountWatcher._isWatching == true) {
      return;
    }

    ElementMountWatcher._isWatching = true;

    const mutationObserver = new MutationObserver((mutationsList, observer) => {
      for (let watcher of this.watcherByElement.values()) {
        const isMounted = watcher.props.element.offsetParent != null;
        watcher._isElementMounted.setValue(isMounted);
      }
    });

    mutationObserver.observe(document.body, {
      childList: true,
      subtree: true,
    });
  }

  private _isElementMounted = Observable.ofEmpty<boolean>(
    Observable.isStrictEqual
  );
  readonly isElementMounted = ReadOnlyObservable.givenObservable(
    this._isElementMounted
  );

  onActivate() {
    ElementMountWatcher.watcherByElement.set(this.props.element, this);
    ElementMountWatcher.watchAllOnce();

    this._isElementMounted.setValue(this.props.element.offsetParent != null);

    this.cancelOnDeactivate(
      new Receipt(() => {
        ElementMountWatcher.watcherByElement.delete(this.props.element);
      })
    );
  }
}
