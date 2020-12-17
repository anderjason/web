"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollArea = void 0;
const geometry_1 = require("@anderjason/geometry");
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const __1 = require("..");
const ElementStyle_1 = require("../ElementStyle");
const DragHorizontal_1 = require("./_internal/DragHorizontal");
const DragVertical_1 = require("./_internal/DragVertical");
const scrollbarThickness = 4;
const scrollbarAreaEdgePadding = 8;
const scrollbarAreaEndPadding = 14;
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
        super(props);
        this._scrollbarSize = observable_1.Observable.ofEmpty();
        this.scrollbarSize = observable_1.ReadOnlyObservable.givenObservable(this._scrollbarSize);
        this._overflowDirection = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.overflowDirection = observable_1.ReadOnlyObservable.givenObservable(this._overflowDirection);
        const totalThickness = scrollbarThickness + scrollbarAreaEdgePadding * 2;
        this._scrollPositionColor = observable_1.Observable.givenValueOrObservable(this.props.scrollPositionColor);
        this._direction = observable_1.Observable.givenValueOrObservable(this.props.direction);
        switch (props.direction) {
            case "none":
                this._scrollbarSize.setValue(geometry_1.Size2.ofZero());
                break;
            case "horizontal":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(0, totalThickness));
                break;
            case "vertical":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(totalThickness, 0));
                break;
            case "both":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(totalThickness, totalThickness));
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
        const horizontalTrackSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        const verticalTrackSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        const horizontalThumb = observable_1.Observable.ofEmpty(geometry_1.Box2.isEqual);
        const verticalThumb = observable_1.Observable.ofEmpty(geometry_1.Box2.isEqual);
        const isHovered = observable_1.Observable.givenValue(false, observable_1.Observable.isStrictEqual);
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
        const trackArea = this.addActor(TrackAreaStyle.toManagedElement({
            tagName: "div",
            parentElement: wrapper.element,
        }));
        const horizontalScrollbarCanvas = this.addActor(new __1.ManagedCanvas({
            parentElement: trackArea.element,
            displaySize: horizontalTrackSize,
            renderEveryFrame: false,
            className: HorizontalTrackStyle.toCombinedClassName(),
        }));
        const verticalScrollbarCanvas = this.addActor(new __1.ManagedCanvas({
            parentElement: trackArea.element,
            displaySize: verticalTrackSize,
            renderEveryFrame: false,
            className: VerticalTrackStyle.toCombinedClassName(),
        }));
        this.cancelOnDeactivate(this._direction.didChange.subscribe((direction) => {
            switch (direction) {
                case "none":
                    this._scroller.style.overflowX = "hidden";
                    this._scroller.style.overflowY = "hidden";
                    break;
                case "vertical":
                    this._scroller.style.overflowX = "hidden";
                    this._scroller.style.overflowY = "scroll";
                    break;
                case "horizontal":
                    this._scroller.style.overflowX = "scroll";
                    this._scroller.style.overflowY = "hidden";
                    break;
                case "both":
                    this._scroller.style.overflowX = "scroll";
                    this._scroller.style.overflowY = "scroll";
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
        if (this.props.anchorBottom == true) {
            this.cancelOnDeactivate(this._contentSizeWatcher.output.didChange.subscribe((newContentSize, oldContentSize) => {
                if (oldContentSize == null) {
                    return;
                }
                const remainingContentBelow = oldContentSize.height -
                    scrollPositionWatcher.position.value.y -
                    this._scroller.element.offsetHeight;
                if (remainingContentBelow < anchorThreshold) {
                    this._scroller.element.scrollTo(0, newContentSize.height);
                }
            }));
        }
        this.cancelOnDeactivate(sizeBinding.didInvalidate.subscribe(() => {
            const wrapperSize = wrapperSizeWatcher.output.value;
            const contentSize = this._contentSizeWatcher.output.value;
            if (wrapperSize == null || contentSize == null) {
                return;
            }
            const isHorizontalVisible = contentSize.width > wrapperSize.width;
            const isVerticalVisible = contentSize.height > wrapperSize.height;
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
            drawRoundRect(context, horizontalThumb.value, scrollbarThickness / 2);
            context.fillStyle = this._scrollPositionColor.value.toHexString();
            context.fill();
        }));
        this.cancelOnDeactivate(verticalScrollbarCanvas.addRenderer(0, (params) => {
            const { context } = params;
            if (verticalThumb.value == null) {
                return;
            }
            drawRoundRect(context, verticalThumb.value, scrollbarThickness / 2);
            context.fillStyle = this._scrollPositionColor.value.toHexString();
            context.fill();
        }));
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
                const trackLengthX = horizontalTrackSize.value.width - scrollbarAreaEndPadding * 2;
                const scrollPositionX = scrollPositionWatcher.position.value.x;
                const visibleStartPercent = scrollPositionX / contentLengthX;
                const visibleEndPercent = (scrollPositionX + visibleLengthX) / contentLengthX;
                horizontalThumb.setValue(geometry_1.Box2.givenOppositeCorners(geometry_1.Point2.givenXY(scrollbarAreaEndPadding + visibleStartPercent * trackLengthX, scrollbarAreaEdgePadding), geometry_1.Point2.givenXY(scrollbarAreaEndPadding + visibleEndPercent * trackLengthX, scrollbarAreaEdgePadding + scrollbarThickness)));
            }
            if (visibleLengthY < contentLengthY) {
                const trackLengthY = verticalTrackSize.value.height - scrollbarAreaEndPadding * 2;
                const scrollPositionY = scrollPositionWatcher.position.value.y;
                const visibleStartPercentY = scrollPositionY / contentLengthY;
                const visibleEndPercentY = (scrollPositionY + visibleLengthY) / contentLengthY;
                verticalThumb.setValue(geometry_1.Box2.givenOppositeCorners(geometry_1.Point2.givenXY(scrollbarAreaEdgePadding, scrollbarAreaEndPadding + visibleStartPercentY * trackLengthY), geometry_1.Point2.givenXY(scrollbarAreaEdgePadding + scrollbarThickness, scrollbarAreaEndPadding + visibleEndPercentY * trackLengthY)));
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
        this.cancelOnDeactivate(isHovered.didChange.subscribe((value) => {
            trackArea.setModifier("isHovered", value);
            horizontalScrollbarCanvas.needsRender();
            verticalScrollbarCanvas.needsRender();
        }, true));
    }
}
exports.ScrollArea = ScrollArea;
ScrollArea.willScroll = new observable_1.TypedEvent();
const WrapperStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Wrapper",
    css: `
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  `,
});
const Scroller = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "ContentArea",
    css: `
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
    -ms-overflow-style: none;

    &::-webkit-scrollbar {
      display: none;
    }
  `,
});
const ContentStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Content",
    css: `
    position: absolute;
    min-width: 100%;
  `,
});
const TrackAreaStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "HorizontalTrackArea",
    css: `
    bottom: 0;
    left: 0;
    opacity: 0.25;
    pointer-events: none;
    position: absolute;
    transition: 0.2s ease opacity;
    right: 0;
    top: 0;
    z-index: 10000;
  `,
    modifiers: {
        isHovered: `
      opacity: 0.9;
    `,
    },
});
const HorizontalTrackStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "HorizontalTrack",
    css: `
    position: absolute;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 10000;
    pointer-events: auto;
  `,
});
const VerticalTrackStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "VerticalTrack",
    css: `
    position: absolute;
    right: 0;
    top: 0;
    bottom: 0;
    pointer-events: auto;
  `,
});
//# sourceMappingURL=index.js.map