"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.DeviceCapabilities = void 0;
const observable_1 = require("@anderjason/observable");
const time_1 = require("@anderjason/time");
const geometry_1 = require("@anderjason/geometry");
class DeviceCapabilities {
    constructor() {
        this._availableSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.availableSize = observable_1.ReadOnlyObservable.givenObservable(this._availableSize);
        this._scrollbarSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.scrollbarSize = observable_1.ReadOnlyObservable.givenObservable(this._scrollbarSize);
        this._measureScrollbarLater = time_1.RateLimitedFunction.givenDefinition({
            fn: async () => {
                this.measureScrollbar();
            },
            duration: time_1.Duration.givenMilliseconds(250),
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
    static get instance() {
        if (this._instance == null) {
            this._instance = new DeviceCapabilities();
        }
        return this._instance;
    }
    measureScrollbar() {
        const measureScrollbarOuter = document.createElement("div");
        measureScrollbarOuter.style.position = "absolute";
        measureScrollbarOuter.style.visibility = "hidden";
        measureScrollbarOuter.style.overflow = "scroll";
        document.body.appendChild(measureScrollbarOuter);
        const measureScrollbarInner = document.createElement("div");
        measureScrollbarOuter.appendChild(measureScrollbarInner);
        const scrollbarWidth = measureScrollbarOuter.offsetWidth - measureScrollbarInner.offsetWidth;
        const scrollbarHeight = measureScrollbarOuter.offsetHeight - measureScrollbarInner.offsetHeight;
        this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(scrollbarWidth, scrollbarHeight));
        document.body.removeChild(measureScrollbarOuter);
    }
    recalculateSize() {
        this._availableSize.setValue(geometry_1.Size2.givenWidthHeight(Math.min(window.outerWidth, window.innerWidth), Math.min(window.innerHeight, window.outerHeight)));
        this._measureScrollbarLater.invoke();
    }
}
exports.DeviceCapabilities = DeviceCapabilities;
//# sourceMappingURL=index.js.map