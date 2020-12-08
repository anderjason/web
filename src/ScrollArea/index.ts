import { Color } from "@anderjason/color";
import { Size2 } from "@anderjason/geometry";
import {
  Observable,
  ObservableBase,
  ReadOnlyObservable,
} from "@anderjason/observable";
import { Actor, MultiBinding } from "skytree";
import {
  DynamicStyleElement,
  ElementSizeWatcher,
  ManagedCanvas,
  ScrollWatcher,
} from "..";
import { ElementStyle } from "../ElementStyle";

export type ScrollDirection = "none" | "vertical" | "horizontal" | "both";

const scrollbarSize = 4.5;
const scrollbarAreaPadding = 8;

function drawRoundRect(
  context: CanvasRenderingContext2D,
  x1: number,
  y1: number,
  x2: number,
  y2: number,
  radius: number
): void {
  context.beginPath();
  context.moveTo(x1 + radius, y1);
  context.arcTo(x2, y1, x2, y2, radius);
  context.arcTo(x2, y2, x1, y2, radius);
  context.arcTo(x1, y2, x1, y1, radius);
  context.arcTo(x1, y1, x2, y1, radius);
  context.closePath();
}

export interface ScrollAreaProps {
  parentElement: HTMLElement | Observable<HTMLElement>;
  direction: ScrollDirection | ObservableBase<ScrollDirection>;
  scrollPositionColor: Color | ObservableBase<Color>;
}

export class ScrollArea extends Actor<ScrollAreaProps> {
  private _scrollbarSize = Observable.ofEmpty<Size2>();
  readonly scrollbarSize = ReadOnlyObservable.givenObservable(
    this._scrollbarSize
  );

  private _scroller: DynamicStyleElement<HTMLDivElement>;
  private _content: DynamicStyleElement<HTMLDivElement>;
  private _scrollPositionColor: ObservableBase<Color>;
  private _direction: ObservableBase<ScrollDirection>;

  constructor(props: ScrollAreaProps) {
    super(props);

    const totalSize = scrollbarSize + scrollbarAreaPadding * 2;

    this._scrollPositionColor = Observable.givenValueOrObservable(
      this.props.scrollPositionColor
    );

    this._direction = Observable.givenValueOrObservable(this.props.direction);

    switch (props.direction) {
      case "none":
        this._scrollbarSize.setValue(Size2.ofZero());
        break;
      case "horizontal":
        this._scrollbarSize.setValue(Size2.givenWidthHeight(0, totalSize));
        break;
      case "vertical":
        this._scrollbarSize.setValue(Size2.givenWidthHeight(totalSize, 0));
        break;
      case "both":
        this._scrollbarSize.setValue(
          Size2.givenWidthHeight(totalSize, totalSize)
        );
        break;
    }
  }

  get element(): HTMLElement {
    return this._content.element;
  }

  get scrollElement(): HTMLElement {
    return this._scroller.element;
  }

  onActivate() {
    const horizontalTrackSize = Observable.ofEmpty<Size2>(Size2.isEqual);
    const verticalTrackSize = Observable.ofEmpty<Size2>(Size2.isEqual);
    const isHovered = Observable.givenValue(false, Observable.isStrictEqual);

    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.props.parentElement,
      })
    );

    this._scroller = this.addActor(
      Scroller.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );

    this._content = this.addActor(
      ContentStyle.toManagedElement({
        tagName: "div",
        parentElement: this._scroller.element,
      })
    );

    const trackArea = this.addActor(
      TrackAreaStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );

    const horizontalScrollbarCanvas = this.addActor(
      new ManagedCanvas({
        parentElement: trackArea.element,
        displaySize: horizontalTrackSize,
        renderEveryFrame: false,
        className: HorizontalTrackStyle.toCombinedClassName(),
      })
    );

    const verticalScrollbarCanvas = this.addActor(
      new ManagedCanvas({
        parentElement: trackArea.element,
        displaySize: verticalTrackSize,
        renderEveryFrame: false,
        className: VerticalTrackStyle.toCombinedClassName(),
      })
    );

    this.cancelOnDeactivate(
      this._direction.didChange.subscribe((direction) => {
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
      }, true)
    );

    const wrapperSizeWatcher = this.addActor(
      new ElementSizeWatcher({
        element: wrapper.element,
      })
    );

    const contentSizeWatcher = this.addActor(
      new ElementSizeWatcher({
        element: this._content.element,
      })
    );

    const scrollPositionWatcher = this.addActor(
      new ScrollWatcher({
        element: this._scroller.element,
      })
    );

    const sizeBinding = this.addActor(
      MultiBinding.givenAnyChange([
        wrapperSizeWatcher.output,
        contentSizeWatcher.output,
      ])
    );

    this.cancelOnDeactivate(
      sizeBinding.didInvalidate.subscribe(() => {
        const wrapperSize = wrapperSizeWatcher.output.value;
        const contentSize = contentSizeWatcher.output.value;

        if (wrapperSize == null || contentSize == null) {
          return;
        }

        const isHorizontalVisible = contentSize.width > wrapperSize.width;
        const isVerticalVisible = contentSize.height > wrapperSize.height;
        const isBothVisible = isHorizontalVisible && isVerticalVisible;

        const padding = isBothVisible
          ? scrollbarAreaPadding * 3
          : scrollbarAreaPadding * 2;

        horizontalTrackSize.setValue(
          Size2.givenWidthHeight(
            wrapperSize.width - padding,
            scrollbarSize + scrollbarAreaPadding
          )
        );

        verticalTrackSize.setValue(
          Size2.givenWidthHeight(
            scrollbarSize + scrollbarAreaPadding,
            wrapperSize.height - padding
          )
        );

        horizontalScrollbarCanvas.needsRender();
        verticalScrollbarCanvas.needsRender();
      }, true)
    );

    this.cancelOnDeactivate(
      horizontalScrollbarCanvas.addRenderer(0, (params) => {
        const { context, pixelSize, devicePixelRatio } = params;

        const trackLength = pixelSize.width;
        const scrollPosition = scrollPositionWatcher.position.value.x;
        const visibleLength = wrapperSizeWatcher.output.value.width;
        const contentLength = contentSizeWatcher.output.value.width;

        if (visibleLength >= contentLength) {
          return;
        }

        const visibleStartPercent = scrollPosition / contentLength;
        const visibleEndPercent =
          (scrollPosition + visibleLength) / contentLength;

        const x1 = visibleStartPercent * trackLength;
        const y1 = 0;
        const x2 = visibleEndPercent * trackLength;
        const y2 = scrollbarSize * devicePixelRatio;

        drawRoundRect(context, x1, y1, x2, y2, scrollbarSize);
        context.fillStyle = this._scrollPositionColor.value.toHexString();
        context.fill();
      })
    );

    this.cancelOnDeactivate(
      verticalScrollbarCanvas.addRenderer(0, (params) => {
        const { context, pixelSize, devicePixelRatio } = params;

        const trackLength = pixelSize.height;
        const scrollPosition = scrollPositionWatcher.position.value.y;
        const visibleLength = wrapperSizeWatcher.output.value.height;
        const contentLength = contentSizeWatcher.output.value.height;

        if (visibleLength >= contentLength) {
          return;
        }

        const visibleStartPercent = scrollPosition / contentLength;
        const visibleEndPercent =
          (scrollPosition + visibleLength) / contentLength;

        const x1 = 0;
        const y1 = visibleStartPercent * trackLength;
        const x2 = scrollbarSize * devicePixelRatio;
        const y2 = visibleEndPercent * trackLength;

        drawRoundRect(context, x1, y1, x2, y2, scrollbarSize);
        context.fillStyle = this._scrollPositionColor.value.toHexString();
        context.fill();
      })
    );

    this.cancelOnDeactivate(
      scrollPositionWatcher.position.didChange.subscribe(() => {
        horizontalScrollbarCanvas.needsRender();
        verticalScrollbarCanvas.needsRender();
      }, true)
    );

    this.cancelOnDeactivate(
      wrapper.addManagedEventListener("pointerenter", () => {
        isHovered.setValue(true);
      })
    );

    this.cancelOnDeactivate(
      wrapper.addManagedEventListener("pointerleave", () => {
        isHovered.setValue(false);
      })
    );

    this.cancelOnDeactivate(
      isHovered.didChange.subscribe((value) => {
        trackArea.setModifier("isHovered", value);
      }, true)
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    bottom: 0;
    left: 0;
    position: absolute;
    right: 0;
    top: 0;
  `,
});

const Scroller = ElementStyle.givenDefinition({
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

const ContentStyle = ElementStyle.givenDefinition({
  elementDescription: "Content",
  css: `
    position: absolute;
  `,
});

const TrackAreaStyle = ElementStyle.givenDefinition({
  elementDescription: "TrackArea",
  css: `
    bottom: 0;
    left: 0;
    opacity: 0.15;
    pointer-events: none;
    position: absolute;
    right: 0;
    top: 0;
    transition: 0.2s ease opacity;
    z-index: 10000;
  `,
  modifiers: {
    isHovered: `
      opacity: 0.9;
    `,
  },
});

const HorizontalTrackStyle = ElementStyle.givenDefinition({
  elementDescription: "HorizontalTrack",
  css: `
    position: absolute;
    left: ${scrollbarAreaPadding}px;
    right: ${scrollbarAreaPadding}px;
    bottom: 0;
    z-index: 10000;
  `,
});

const VerticalTrackStyle = ElementStyle.givenDefinition({
  elementDescription: "VerticalTrack",
  css: `
    position: absolute;
    right: 0;
    top: ${scrollbarAreaPadding}px;
    bottom: 0;
  `,
});
