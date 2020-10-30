import { Observable, ObservableSet, Receipt } from "@anderjason/observable";
import { Actor } from "skytree";
import { ElementMountWatcher } from "../ElementMountWatcher";

export interface ManagedElementDefinition<
  K extends keyof HTMLElementTagNameMap
> {
  tagName: K;

  parentElement?: HTMLElement | Observable<HTMLElement>;
  classNames?: string[] | ObservableSet<string>;
  transitionIn?: (element: ManagedElement<HTMLElementTagNameMap[K]>) => void;
  transitionOut?: (
    element: ManagedElement<HTMLElementTagNameMap[K]>
  ) => Promise<void>;
  innerHTML?: string;
}

export class ManagedElement<T extends HTMLElement> extends Actor {
  readonly element: T;
  readonly parentElement: Observable<HTMLElement>;
  readonly classes: ObservableSet<string>;

  static givenDefinition<K extends keyof HTMLElementTagNameMap>(
    definition: ManagedElementDefinition<K>
  ): ManagedElement<HTMLElementTagNameMap[K]> {
    return new ManagedElement(definition);
  }

  private _transitionIn?: (element: ManagedElement<T>) => void;
  private _transitionOut?: (element: ManagedElement<T>) => Promise<void>;

  private constructor(definition: ManagedElementDefinition<any>) {
    super({});

    this.element = document.createElement(definition.tagName);

    if (this.props.innerHTML != null) {
      this.element.innerHTML = this.props.innerHTML;
    }

    this._transitionIn = definition.transitionIn;
    this._transitionOut = definition.transitionOut;

    if (definition.classNames == null) {
      this.classes = ObservableSet.ofEmpty();
    } else if (Array.isArray(definition.classNames)) {
      this.classes = ObservableSet.givenValues(definition.classNames);
    } else {
      this.classes = definition.classNames;
    }

    if (definition.parentElement == null) {
      this.parentElement = Observable.ofEmpty();
    } else if (Observable.isObservable(definition.parentElement)) {
      this.parentElement = definition.parentElement;
    } else {
      this.parentElement = Observable.givenValue(
        definition.parentElement,
        Observable.isStrictEqual
      );
    }
  }

  get style(): CSSStyleDeclaration {
    return this.element.style;
  }

  onActivate() {
    this.element.className = this.classes.toArray().join(" ");

    this.cancelOnDeactivate(
      this.parentElement.didChange.subscribe(async (parentElement) => {
        if (this.element.parentElement === parentElement) {
          return;
        }

        if (this.element.parentElement != null) {
          if (this._transitionOut != null) {
            await this._transitionOut(this);
          }

          this.element.parentElement.removeChild(this.element);
        }

        if (parentElement != null) {
          parentElement.appendChild(this.element);
        }
      }, true)
    );

    if (this._transitionIn != null || this._transitionOut != null) {
      this.watchDomVisibility();
    }

    let classesChangedReceipt: Receipt;

    this.cancelOnDeactivate(
      new Receipt(async () => {
        if (this._transitionOut != null) {
          try {
            await this._transitionOut(this);
          } catch (err) {
            console.error(err);
          }
        }

        if (this.element.parentElement != null) {
          this.element.parentElement.removeChild(this.element);
        }

        classesChangedReceipt.cancel();
      })
    );

    classesChangedReceipt = this.classes.didChangeSteps.subscribe((changes) => {
      if (changes == null) {
        return;
      }

      changes.forEach((change) => {
        switch (change.type) {
          case "add":
            this.element.classList.add(change.value);
            break;
          case "remove":
            this.element.classList.remove(change.value);
            break;
        }
      });
    });
  }

  addManagedEventListener<K extends keyof HTMLElementEventMap>(
    type: K,
    listener: (this: HTMLElement, ev: HTMLElementEventMap[K]) => any,
    options?: boolean | AddEventListenerOptions
  ): Receipt {
    this.element.addEventListener(type, listener, options);

    return this.cancelOnDeactivate(
      new Receipt(() => {
        this.element.removeEventListener(type, listener, options);
      })
    );
  }

  private watchDomVisibility() {
    const elementMountWatcher = this.addActor(
      new ElementMountWatcher({
        element: this.element,
      })
    );

    this.cancelOnDeactivate(
      elementMountWatcher.isElementMounted.didChange.subscribe((isMounted) => {
        requestAnimationFrame(() => {
          if (!this.isActive.value) {
            return;
          }

          try {
            if (isMounted) {
              if (this._transitionIn != null) {
                this._transitionIn(this);
              }
            } else {
              // it's too late at this point for any transition out to
              // be visible, because the element has already been removed
              // from the DOM, but it's still important to run the function
              // because the element may need to transition in again later
              // so it needs a chance to update its state
              if (this._transitionOut != null) {
                this._transitionOut(this).catch((err) => {
                  console.warn(err);
                });
              }
            }
          } catch (err) {
            console.warn(err);
          }
        });
      }, true)
    );
  }
}
