"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollArea = void 0;
const geometry_1 = require("@anderjason/geometry");
const observable_1 = require("@anderjason/observable");
const time_1 = require("@anderjason/time");
const skytree_1 = require("skytree");
const __1 = require("..");
const ElementStyle_1 = require("../ElementStyle");
const DragHorizontal_1 = require("./_internal/DragHorizontal");
const DragVertical_1 = require("./_internal/DragVertical");
const anchorThreshold = 5;
let devicePixelRatio = 1;
if (typeof window !== "undefined") {
    devicePixelRatio = window.devicePixelRatio || 1;
}
function drawRoundRect(context, box, radius) {
    if (context == null || box == null) {
        return;
    }
    const deviceRadius = radius * devicePixelRatio;
    const x1 = box.toLeft() * devicePixelRatio;
    const y1 = box.toTop() * devicePixelRatio;
    const x2 = box.toRight() * devicePixelRatio;
    const y2 = box.toBottom() * devicePixelRatio;
    context.beginPath();
    context.moveTo(x1 + deviceRadius, y1);
    context.arcTo(x2, y1, x2, y2, deviceRadius);
    context.arcTo(x2, y2, x1, y2, deviceRadius);
    context.arcTo(x1, y2, x1, y1, deviceRadius);
    context.arcTo(x1, y1, x2, y1, deviceRadius);
    context.closePath();
}
class ScrollArea extends skytree_1.Actor {
    constructor(props) {
        var _a, _b, _c, _d, _e, _f, _g, _h, _j, _k, _l, _m, _o, _p, _q, _r, _s, _t, _u, _v;
        super(props);
        this._scrollbarSize = observable_1.Observable.ofEmpty();
        this.scrollbarSize = observable_1.ReadOnlyObservable.givenObservable(this._scrollbarSize);
        this._overflowDirection = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.overflowDirection = observable_1.ReadOnlyObservable.givenObservable(this._overflowDirection);
        this._thumbWidth = props.thumbWidth || 4;
        this._verticalTrackSize = {
            leadingPadding: (_b = (_a = props.verticalTrackSize) === null || _a === void 0 ? void 0 : _a.leadingPadding) !== null && _b !== void 0 ? _b : this._thumbWidth * 3,
            trailingPadding: (_d = (_c = props.verticalTrackSize) === null || _c === void 0 ? void 0 : _c.trailingPadding) !== null && _d !== void 0 ? _d : this._thumbWidth * 3,
            innerPadding: (_f = (_e = props.verticalTrackSize) === null || _e === void 0 ? void 0 : _e.innerPadding) !== null && _f !== void 0 ? _f : this._thumbWidth * 2,
            outerPadding: (_h = (_g = props.verticalTrackSize) === null || _g === void 0 ? void 0 : _g.outerPadding) !== null && _h !== void 0 ? _h : this._thumbWidth * 2,
            thumbRadius: (_k = (_j = props.verticalTrackSize) === null || _j === void 0 ? void 0 : _j.thumbRadius) !== null && _k !== void 0 ? _k : this._thumbWidth / 2,
        };
        this._horizontalTrackSize = {
            leadingPadding: (_m = (_l = props.horizontalTrackSize) === null || _l === void 0 ? void 0 : _l.leadingPadding) !== null && _m !== void 0 ? _m : this._thumbWidth * 3,
            trailingPadding: (_p = (_o = props.horizontalTrackSize) === null || _o === void 0 ? void 0 : _o.trailingPadding) !== null && _p !== void 0 ? _p : this._thumbWidth * 3,
            innerPadding: (_r = (_q = props.horizontalTrackSize) === null || _q === void 0 ? void 0 : _q.innerPadding) !== null && _r !== void 0 ? _r : this._thumbWidth * 2,
            outerPadding: (_t = (_s = props.horizontalTrackSize) === null || _s === void 0 ? void 0 : _s.outerPadding) !== null && _t !== void 0 ? _t : this._thumbWidth * 2,
            thumbRadius: (_v = (_u = props.horizontalTrackSize) === null || _u === void 0 ? void 0 : _u.thumbRadius) !== null && _v !== void 0 ? _v : this._thumbWidth / 2,
        };
        const totalVerticalThickness = this._verticalTrackSize.innerPadding +
            this._verticalTrackSize.outerPadding +
            this._thumbWidth;
        const totalHorizontalThickness = this._horizontalTrackSize.innerPadding +
            this._horizontalTrackSize.outerPadding +
            this._thumbWidth;
        this._scrollPositionColor = observable_1.Observable.givenValueOrObservable(this.props.scrollPositionColor);
        this._contentArea = observable_1.Observable.givenValueOrObservable(this.props.contentArea || "full");
        this._anchorBottom = observable_1.Observable.givenValueOrObservable(this.props.anchorBottom || false);
        this._direction = observable_1.Observable.givenValueOrObservable(this.props.direction);
        switch (props.direction) {
            case "none":
                this._scrollbarSize.setValue(geometry_1.Size2.ofZero());
                break;
            case "horizontal":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(0, totalHorizontalThickness));
                break;
            case "vertical":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(totalVerticalThickness, 0));
                break;
            case "both":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(totalVerticalThickness, totalHorizontalThickness));
                break;
        }
    }
    get contentSize() {
        return this._contentSizeWatcher.output;
    }
    get element() {
        return this._content.element;
    }
    get scrollElement() {
        return this._scroller.element;
    }
    onActivate() {
        var _a, _b;
        const horizontalTrackSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        const verticalTrackSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        const horizontalThumb = observable_1.Observable.ofEmpty(geometry_1.Box2.isEqual);
        const verticalThumb = observable_1.Observable.ofEmpty(geometry_1.Box2.isEqual);
        const areScrollTracksVisible = observable_1.Observable.givenValue(true, observable_1.Observable.isStrictEqual);
        const isHovered = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
        const showScrollTracksLater = new time_1.Debounce({
            duration: time_1.Duration.givenSeconds(0.075),
            fn: () => {
                areScrollTracksVisible.setValue(true);
            },
        });
        const wrapper = this.addActor(WrapperStyle.toManagedElement({
            tagName: "div",
            parentElement: this.props.parentElement,
        }));
        this._scroller = this.addActor(Scroller.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        }));
        this._content = this.addActor(ContentStyle.toManagedElement({
            tagName: "div",
            parentElement: this._scroller.element,
        }));
        const TrackAreaStyle = ElementStyle_1.ElementStyle.givenDefinition({
            elementDescription: "TrackArea",
            css: `
        height: 100%;
        left: 0;
        opacity: 0;
        pointer-events: none;
        position: absolute;
        top: 0;
        width: 100%;
        z-index: 10000;
      `,
            modifiers: {
                isVisible: `
          opacity: ${(_a = this.props.trackIdleOpacity) !== null && _a !== void 0 ? _a : 0.25};
          transition: 0.3s ease opacity;
        `,
                isHovered: `
          opacity: ${(_b = this.props.trackHoverOpacity) !== null && _b !== void 0 ? _b : 0.9};
        `,
            },
        });
        const trackArea = this.addActor(TrackAreaStyle.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        }));
        const horizontalScrollbarClassName = observable_1.Observable.givenValue(HorizontalTrackStyle.toCombinedClassName());
        const horizontalScrollbarCanvas = this.addActor(new __1.ManagedCanvas({
            parentElement: trackArea.element,
            displaySize: horizontalTrackSize,
            renderEveryFrame: false,
            className: horizontalScrollbarClassName,
        }));
        const verticalScrollbarClassName = observable_1.Observable.givenValue(VerticalTrackStyle.toCombinedClassName());
        const verticalScrollbarCanvas = this.addActor(new __1.ManagedCanvas({
            parentElement: trackArea.element,
            displaySize: verticalTrackSize,
            renderEveryFrame: false,
            className: verticalScrollbarClassName,
        }));
        this.cancelOnDeactivate(this._direction.didChange.subscribe((direction) => {
            switch (direction) {
                case "none":
                    this._scroller.style.overflowX = "hidden";
                    this._scroller.style.overflowY = "hidden";
                    this._content.style.flexDirection = "column";
                    break;
                case "vertical":
                    this._scroller.style.overflowX = "hidden";
                    this._scroller.style.overflowY = "scroll";
                    this._content.style.flexDirection = "column";
                    break;
                case "horizontal":
                    this._scroller.style.overflowX = "scroll";
                    this._scroller.style.overflowY = "hidden";
                    this._content.style.flexDirection = "row";
                    break;
                case "both":
                    this._scroller.style.overflowX = "scroll";
                    this._scroller.style.overflowY = "scroll";
                    this._content.style.flexDirection = "column";
                    break;
                default:
                    throw new Error("Unsupported direction");
            }
        }, true));
        const wrapperSizeWatcher = this.addActor(new __1.ElementSizeWatcher({
            element: wrapper.element,
        }));
        this._contentSizeWatcher = this.addActor(new __1.ElementSizeWatcher({
            element: this._content.element,
        }));
        const scrollPositionWatcher = this.addActor(new __1.ScrollWatcher({
            element: this._scroller.element,
        }));
        const sizeBinding = this.addActor(skytree_1.MultiBinding.givenAnyChange([
            wrapperSizeWatcher.output,
            this._contentSizeWatcher.output,
        ]));
        this.cancelOnDeactivate(this._contentSizeWatcher.output.didChange.subscribe((newContentSize, oldContentSize) => {
            if (oldContentSize == null) {
                return;
            }
            if (this._anchorBottom.value == false) {
                return;
            }
            const remainingContentBelow = oldContentSize.height -
                scrollPositionWatcher.position.value.y -
                this._scroller.element.offsetHeight;
            if (remainingContentBelow < anchorThreshold) {
                this._scroller.element.scrollTo(0, newContentSize.height);
            }
        }));
        this.cancelOnDeactivate(sizeBinding.didInvalidate.subscribe(() => {
            const wrapperSize = wrapperSizeWatcher.output.value;
            const contentSize = this._contentSizeWatcher.output.value;
            areScrollTracksVisible.setValue(false);
            showScrollTracksLater.invoke();
            if (wrapperSize == null || contentSize == null) {
                return;
            }
            const isHorizontalVisible = contentSize.width - wrapperSize.width > 3;
            const isVerticalVisible = contentSize.height - wrapperSize.height > 3;
            const isBothVisible = isHorizontalVisible && isVerticalVisible;
            if (isBothVisible) {
                this._overflowDirection.setValue("both");
            }
            else if (isHorizontalVisible) {
                this._overflowDirection.setValue("horizontal");
            }
            else if (isVerticalVisible) {
                this._overflowDirection.setValue("vertical");
            }
            else {
                this._overflowDirection.setValue("none");
            }
            horizontalScrollbarClassName.setValue(HorizontalTrackStyle.toCombinedClassName(isHorizontalVisible ? "isVisible" : ""));
            verticalScrollbarClassName.setValue(VerticalTrackStyle.toCombinedClassName(isVerticalVisible ? "isVisible" : ""));
            const sizeOffset = isBothVisible ? 6 : 0;
            horizontalTrackSize.setValue(geometry_1.Size2.givenWidthHeight(wrapperSize.width - sizeOffset, this._scrollbarSize.value.height));
            verticalTrackSize.setValue(geometry_1.Size2.givenWidthHeight(this._scrollbarSize.value.width, wrapperSize.height - sizeOffset));
            horizontalScrollbarCanvas.needsRender();
            verticalScrollbarCanvas.needsRender();
        }, true));
        this.cancelOnDeactivate(horizontalScrollbarCanvas.addRenderer(0, (params) => {
            const { context } = params;
            if (horizontalThumb.value == null) {
                return;
            }
            drawRoundRect(context, horizontalThumb.value, this._horizontalTrackSize.thumbRadius);
            context.fillStyle = this._scrollPositionColor.value.toHexString();
            context.fill();
        }));
        this.cancelOnDeactivate(verticalScrollbarCanvas.addRenderer(0, (params) => {
            const { context } = params;
            if (verticalThumb.value == null) {
                return;
            }
            drawRoundRect(context, verticalThumb.value, this._verticalTrackSize.thumbRadius);
            context.fillStyle = this._scrollPositionColor.value.toHexString();
            context.fill();
        }));
        const contentSizeBinding = this.addActor(skytree_1.MultiBinding.givenAnyChange([
            this._contentArea,
            this._overflowDirection
        ]));
        this.cancelOnDeactivate(contentSizeBinding.didInvalidate.subscribe(() => {
            const contentArea = this._contentArea.value;
            const overflowDirection = this._overflowDirection.value;
            if (contentArea == null || overflowDirection == null) {
                return;
            }
            if (contentArea == "full" || overflowDirection == "none") {
                this._scroller.style.width = `100%`;
                this._scroller.style.height = `100%`;
                this._content.style.minHeight = "100%";
                this._content.style.minWidth = "100%";
                return;
            }
            const trackHeight = horizontalTrackSize.value.height;
            const trackWidth = verticalTrackSize.value.width;
            if (overflowDirection == "both") {
                this._scroller.style.height = `calc(100% - ${trackHeight}px)`;
                this._scroller.style.width = `calc(100% - ${trackWidth}px)`;
                return;
            }
            this._content.style.minWidth = "auto";
            this._content.style.minHeight = "auto";
            if (overflowDirection == "horizontal") {
                this._scroller.style.height = `calc(100% - ${trackHeight}px)`;
                this._content.style.height = "100%";
            }
            if (overflowDirection == "vertical") {
                this._scroller.style.width = `calc(100% - ${trackWidth}px)`;
                this._content.style.width = "100%";
            }
        }, true));
        const thumbBinding = this.addActor(skytree_1.MultiBinding.givenAnyChange([
            scrollPositionWatcher.position,
            wrapperSizeWatcher.output,
            this._contentSizeWatcher.output,
            horizontalTrackSize,
            verticalTrackSize,
        ]));
        this.cancelOnDeactivate(thumbBinding.didInvalidate.subscribe(() => {
            const visibleLengthX = wrapperSizeWatcher.output.value.width;
            const visibleLengthY = wrapperSizeWatcher.output.value.height;
            const contentLengthX = this._contentSizeWatcher.output.value.width;
            const contentLengthY = this._contentSizeWatcher.output.value.height;
            if (visibleLengthX < contentLengthX) {
                const trackLengthX = horizontalTrackSize.value.width -
                    this._horizontalTrackSize.leadingPadding -
                    this._horizontalTrackSize.trailingPadding;
                const scrollPositionX = scrollPositionWatcher.position.value.x;
                const visibleStartPercent = scrollPositionX / contentLengthX;
                const visibleEndPercent = (scrollPositionX + visibleLengthX) / contentLengthX;
                horizontalThumb.setValue(geometry_1.Box2.givenOppositeCorners(geometry_1.Point2.givenXY(this._horizontalTrackSize.leadingPadding +
                    visibleStartPercent * trackLengthX, this._horizontalTrackSize.innerPadding), geometry_1.Point2.givenXY(this._horizontalTrackSize.leadingPadding +
                    visibleEndPercent * trackLengthX, this._horizontalTrackSize.innerPadding + this._thumbWidth)));
            }
            if (visibleLengthY < contentLengthY) {
                const trackLengthY = verticalTrackSize.value.height -
                    this._verticalTrackSize.leadingPadding -
                    this._verticalTrackSize.trailingPadding;
                const scrollPositionY = scrollPositionWatcher.position.value.y;
                const visibleStartPercentY = scrollPositionY / contentLengthY;
                const visibleEndPercentY = (scrollPositionY + visibleLengthY) / contentLengthY;
                verticalThumb.setValue(geometry_1.Box2.givenOppositeCorners(geometry_1.Point2.givenXY(this._verticalTrackSize.innerPadding, this._verticalTrackSize.leadingPadding +
                    visibleStartPercentY * trackLengthY), geometry_1.Point2.givenXY(this._verticalTrackSize.innerPadding + this._thumbWidth, this._verticalTrackSize.leadingPadding +
                    visibleEndPercentY * trackLengthY)));
            }
            else {
                verticalThumb.setValue(undefined);
            }
        }, true));
        this.cancelOnDeactivate(horizontalThumb.didChange.subscribe(() => {
            horizontalScrollbarCanvas.needsRender();
        }, true));
        this.cancelOnDeactivate(verticalThumb.didChange.subscribe(() => {
            verticalScrollbarCanvas.needsRender();
        }, true));
        this.cancelOnDeactivate(wrapper.addManagedEventListener("pointerenter", () => {
            isHovered.setValue(true);
        }));
        this.cancelOnDeactivate(wrapper.addManagedEventListener("pointerleave", () => {
            isHovered.setValue(false);
        }));
        this.cancelOnDeactivate(wrapper.addManagedEventListener("pointerdown", () => {
            if (this._overflowDirection.value === "none") {
                return;
            }
            ScrollArea.willScroll.emit(this);
        }));
        this.addActor(new DragHorizontal_1.DragHorizontal({
            canvas: horizontalScrollbarCanvas.managedElement,
            scrollElement: this._scroller.element,
            trackSize: horizontalTrackSize,
            thumb: horizontalThumb,
        }));
        this.addActor(new DragVertical_1.DragVertical({
            canvas: verticalScrollbarCanvas.managedElement,
            scrollElement: this._scroller.element,
            trackSize: verticalTrackSize,
            thumb: verticalThumb,
        }));
        const trackAreaBinding = this.addActor(skytree_1.MultiBinding.givenAnyChange([isHovered, areScrollTracksVisible]));
        this.cancelOnDeactivate(trackAreaBinding.didInvalidate.subscribe(() => {
            if (areScrollTracksVisible.value == true) {
                trackArea.setModifier("isVisible", true);
                trackArea.setModifier("isHovered", isHovered.value);
                horizontalScrollbarCanvas.needsRender();
                verticalScrollbarCanvas.needsRender();
            }
            else {
                trackArea.setModifier("isVisible", false);
                trackArea.setModifier("isHovered", false);
            }
        }, true));
    }
}
exports.ScrollArea = ScrollArea;
ScrollArea.willScroll = new observable_1.TypedEvent();
const WrapperStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Wrapper",
    css: `
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  `,
});
const Scroller = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Scroller",
    css: `
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
    -ms-overflow-style: none;
    scrollbar-width: none;
    
    &::-webkit-scrollbar {
      display: none;
    }
  `,
});
const ContentStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Content",
    css: `
    position: absolute;
    display: flex;
  `,
});
const HorizontalTrackStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "HorizontalTrack",
    css: `
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    pointer-events: none;
    opacity: 0;
  `,
    modifiers: {
        isVisible: `
      opacity: 1;
      pointer-events: auto;
    `,
    },
});
const VerticalTrackStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "VerticalTrack",
    css: `
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    opacity: 0;
    pointer-events: none;
  `,
    modifiers: {
        isVisible: `
      pointer-events: auto;
      opacity: 1;
    `,
    },
});
//# sourceMappingURL=index.js.map