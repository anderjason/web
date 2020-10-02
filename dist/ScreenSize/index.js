"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScreenSize = void 0;
const observable_1 = require("@anderjason/observable");
const time_1 = require("@anderjason/time");
const geometry_1 = require("@anderjason/geometry");
const skytree_1 = require("skytree");
class ScreenSize extends skytree_1.ManagedObject {
    constructor() {
        super();
        this._availableSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.availableSize = observable_1.ReadOnlyObservable.givenObservable(this._availableSize);
        this._scrollbarSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.scrollbarSize = observable_1.ReadOnlyObservable.givenObservable(this._scrollbarSize);
        this.isPollingEnabled = observable_1.Observable.givenValue(true, observable_1.Observable.isStrictEqual);
        this._measureScrollbarLater = new time_1.Debounce({
            fn: async () => {
                this.measureScrollbar();
            },
            duration: time_1.Duration.givenMilliseconds(250),
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
        this.addManagedObject(new skytree_1.ConditionalInitializer({
            input: this.isPollingEnabled,
            fn: (v) => v,
            instance: new skytree_1.Timer({
                fn: () => {
                    this.recalculateSize();
                },
                isRepeating: true,
                duration: time_1.Duration.givenSeconds(0.25),
            }),
        }));
    }
    static get instance() {
        if (this._instance == null) {
            this._instance = new ScreenSize();
            this._instance.activate();
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
exports.ScreenSize = ScreenSize;
//# sourceMappingURL=index.js.map