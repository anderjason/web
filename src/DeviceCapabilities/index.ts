import { Observable, ReadOnlyObservable } from "@anderjason/observable";
import { Duration, RateLimitedFunction } from "@anderjason/time";
import { Size2 } from "@anderjason/geometry";

export class DeviceCapabilities {
  private static _instance: DeviceCapabilities;

  static get instance(): DeviceCapabilities {
    if (this._instance == null) {
      this._instance = new DeviceCapabilities();
    }

    return this._instance;
  }

  private _measureScrollbarLater: RateLimitedFunction<void>;

  private _availableSize = Observable.ofEmpty<Size2>(Size2.isEqual);
  readonly availableSize = ReadOnlyObservable.givenObservable(
    this._availableSize
  );

  private _scrollbarSize = Observable.ofEmpty<Size2>(Size2.isEqual);
  readonly scrollbarSize = ReadOnlyObservable.givenObservable(
    this._scrollbarSize
  );

  private constructor() {
    this._measureScrollbarLater = RateLimitedFunction.givenDefinition({
      fn: async () => {
        this.measureScrollbar();
      },
      duration: Duration.givenMilliseconds(250),
      mode: "both",
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

  private recalculateSize() {
    this._availableSize.setValue(
      Size2.givenWidthHeight(
        Math.min(window.outerWidth, window.innerWidth),
        Math.min(window.innerHeight, window.outerHeight)
      )
    );

    this._measureScrollbarLater.invoke();
  }
}
