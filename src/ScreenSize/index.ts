import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Duration, Debounce } from "@anderjason/time";
import { Size2 } from "@anderjason/geometry";
import { ConditionalInitializer, ManagedObject, Timer } from "skytree";

export class ScreenSize extends ManagedObject<void> {
  private static _instance: ScreenSize;

  static get instance(): ScreenSize {
    if (this._instance == null) {
      this._instance = new ScreenSize();
      this._instance.activate();
    }

    return this._instance;
  }

  private _measureScrollbarLater: Debounce;

  private _availableSize = Observable.ofEmpty<Size2>(Size2.isEqual);
  readonly availableSize = ReadOnlyObservable.givenObservable(
    this._availableSize
  );

  private _scrollbarSize = Observable.ofEmpty<Size2>(Size2.isEqual);
  readonly scrollbarSize = ReadOnlyObservable.givenObservable(
    this._scrollbarSize
  );

  readonly isPollingEnabled = Observable.givenValue(
    true,
    Observable.isStrictEqual
  );

  private constructor() {
    super();

    this._measureScrollbarLater = new Debounce({
      fn: async () => {
        this.measureScrollbar();
      },
      duration: Duration.givenMilliseconds(250),
    });

    window.addEventListener("resize", () => {
      this.recalculateSize();
    });

    this.recalculateSize();

    if (this._availableSize.value.isZero) {
      requestAnimationFrame(() => {
        this.recalculateSize();
      });
    }

    this.addManagedObject(
      new ConditionalInitializer({
        input: this.isPollingEnabled,
        fn: (v) => v,
        instance: new Timer({
          fn: () => {
            this.recalculateSize();
          },
          duration: Duration.givenSeconds(0.25),
        }),
      })
    );
  }

  private measureScrollbar(): void {
    const measureScrollbarOuter = document.createElement("div");
    measureScrollbarOuter.style.position = "absolute";
    measureScrollbarOuter.style.visibility = "hidden";
    measureScrollbarOuter.style.overflow = "scroll";
    document.body.appendChild(measureScrollbarOuter);

    const measureScrollbarInner = document.createElement("div");
    measureScrollbarOuter.appendChild(measureScrollbarInner);

    const scrollbarWidth =
      measureScrollbarOuter.offsetWidth - measureScrollbarInner.offsetWidth;

    const scrollbarHeight =
      measureScrollbarOuter.offsetHeight - measureScrollbarInner.offsetHeight;

    this._scrollbarSize.setValue(
      Size2.givenWidthHeight(scrollbarWidth, scrollbarHeight)
    );

    document.body.removeChild(measureScrollbarOuter);
  }

  recalculateSize() {
    this._availableSize.setValue(
      Size2.givenWidthHeight(
        Math.min(window.outerWidth, window.innerWidth),
        Math.min(window.innerHeight, window.outerHeight)
      )
    );

    this._measureScrollbarLater.invoke();
  }
}
