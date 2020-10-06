import { Actor, Timer } from "skytree";
import { Receipt, Observable, ObservableSet } from "@anderjason/observable";
import { Duration } from "@anderjason/time";

export interface ManagedElementDefinition<
  K extends keyof HTMLElementTagNameMap
> {
  tagName: K;

  parentElement?: HTMLElement | Observable<HTMLElement>;
  classNames?: string[] | ObservableSet<string>;
  transitionIn?: () => void;
  transitionOut?: () => Promise<void>;
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

  private _transitionIn?: () => void;
  private _transitionOut?: () => Promise<void>;

  private constructor(definition: ManagedElementDefinition<any>) {
    super({});

    this.element = document.createElement(definition.tagName);
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
    this.cancelOnDeactivate(
      this.parentElement.didChange.subscribe((parentElement) => {
        if (this.element.parentElement === parentElement) {
          return;
        }

        if (this.element.parentElement != null) {
          this.element.parentElement.removeChild(this.element);
        }

        if (parentElement != null) {
          parentElement.appendChild(this.element);
        }
      }, true)
    );

    if (this._transitionIn != null) {
      this.addActor(
        new Timer({
          fn: () => {
            this._transitionIn();
          },
          isRepeating: false,
          duration: Duration.givenMilliseconds(25)
        })
      );
    }

    let classesChangedReceipt: Receipt;

    const cleanup = () => {
      if (this.element.parentElement != null) {
        this.element.parentElement.removeChild(this.element);
      }

      classesChangedReceipt.cancel();
    };

    this.cancelOnDeactivate(
      new Receipt(() => {
        if (this._transitionOut == null) {
          cleanup();
        } else {
          this._transitionOut()
            .then(cleanup)
            .catch((err) => {
              console.error(err);
              cleanup();
            });
        }
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
}
