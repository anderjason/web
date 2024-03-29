import { Color } from "@anderjason/color";
import { Box2, Point2, Size2 } from "@anderjason/geometry";
import {
  Observable,
  ObservableBase,
  ReadOnlyObservable,
  TypedEvent
} from "@anderjason/observable";
import { Debounce, Duration } from "@anderjason/time";
import { Actor, MultiBinding } from "skytree";
import {
  DynamicStyleElement,
  ElementSizeWatcher,
  ManagedCanvas,
  ScrollWatcher
} from "..";
import { ElementStyle } from "../ElementStyle";
import { DragHorizontal } from "./_internal/DragHorizontal";
import { DragVertical } from "./_internal/DragVertical";

export type ScrollDirection = "none" | "vertical" | "horizontal" | "both";
export type ContentArea = "full" | "inset";

const anchorThreshold = 5;

let devicePixelRatio: number = 1;
if (typeof window !== "undefined") {
  devicePixelRatio = window.devicePixelRatio || 1;
}

function drawRoundRect(
  context: CanvasRenderingContext2D,
  box: Box2,
  radius: number
): void {
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

export interface ScrollAreaTrackSize {
  leadingPadding?: number;
  trailingPadding?: number;
  innerPadding?: number;
  outerPadding?: number;
  thumbRadius?: number;
}

export interface ScrollAreaProps {
  parentElement: HTMLElement | Observable<HTMLElement>;
  direction: ScrollDirection | ObservableBase<ScrollDirection>;
  scrollPositionColor: Color | ObservableBase<Color>;

  anchorBottom?: boolean | ObservableBase<boolean>;
  contentArea?: ContentArea | ObservableBase<ContentArea>;
  horizontalTrackSize?: ScrollAreaTrackSize;
  verticalTrackSize?: ScrollAreaTrackSize;
  trackIdleOpacity?: number;
  trackHoverOpacity?: number;
  thumbWidth?: number;
}

export class ScrollArea extends Actor<ScrollAreaProps> {
  static readonly willScroll = new TypedEvent<ScrollArea>();

  private _scrollbarSize = Observable.ofEmpty<Size2>();
  readonly scrollbarSize = ReadOnlyObservable.givenObservable(
    this._scrollbarSize
  );

  private _overflowDirection = Observable.ofEmpty<ScrollDirection>(
    Observable.isStrictEqual
  );
  readonly overflowDirection = ReadOnlyObservable.givenObservable(
    this._overflowDirection
  );

  private _scroller: DynamicStyleElement<HTMLDivElement>;
  private _content: DynamicStyleElement<HTMLDivElement>;
  private _scrollPositionColor: ObservableBase<Color>;
  private _contentArea: ObservableBase<ContentArea>;
  private _anchorBottom: ObservableBase<boolean>;
  private _direction: ObservableBase<ScrollDirection>;
  private _contentSizeWatcher: ElementSizeWatcher;
  private _verticalTrackSize: ScrollAreaTrackSize;
  private _horizontalTrackSize: ScrollAreaTrackSize;
  private _thumbWidth: number;

  get contentSize(): ReadOnlyObservable<Size2> {
    return this._contentSizeWatcher.output;
  }

  constructor(props: ScrollAreaProps) {
    super(props);

    this._thumbWidth = props.thumbWidth || 4;

    this._verticalTrackSize = {
      leadingPadding:
        props.verticalTrackSize?.leadingPadding ?? this._thumbWidth * 3,
      trailingPadding:
        props.verticalTrackSize?.trailingPadding ?? this._thumbWidth * 3,
      innerPadding:
        props.verticalTrackSize?.innerPadding ?? this._thumbWidth * 2,
      outerPadding:
        props.verticalTrackSize?.outerPadding ?? this._thumbWidth * 2,
      thumbRadius: props.verticalTrackSize?.thumbRadius ?? this._thumbWidth / 2,
    };

    this._horizontalTrackSize = {
      leadingPadding:
        props.horizontalTrackSize?.leadingPadding ?? this._thumbWidth * 3,
      trailingPadding:
        props.horizontalTrackSize?.trailingPadding ?? this._thumbWidth * 3,
      innerPadding:
        props.horizontalTrackSize?.innerPadding ?? this._thumbWidth * 2,
      outerPadding:
        props.horizontalTrackSize?.outerPadding ?? this._thumbWidth * 2,
      thumbRadius:
        props.horizontalTrackSize?.thumbRadius ?? this._thumbWidth / 2,
    };

    const totalVerticalThickness =
      this._verticalTrackSize.innerPadding +
      this._verticalTrackSize.outerPadding +
      this._thumbWidth;

    const totalHorizontalThickness =
      this._horizontalTrackSize.innerPadding +
      this._horizontalTrackSize.outerPadding +
      this._thumbWidth;

    this._scrollPositionColor = Observable.givenValueOrObservable(
      this.props.scrollPositionColor
    );

    this._contentArea = Observable.givenValueOrObservable(
      this.props.contentArea || "full"
    );

    this._anchorBottom = Observable.givenValueOrObservable(
      this.props.anchorBottom || false
    );
    this._direction = Observable.givenValueOrObservable(this.props.direction);

    switch (props.direction) {
      case "none":
        this._scrollbarSize.setValue(Size2.ofZero());
        break;
      case "horizontal":
        this._scrollbarSize.setValue(
          Size2.givenWidthHeight(0, totalHorizontalThickness)
        );
        break;
      case "vertical":
        this._scrollbarSize.setValue(
          Size2.givenWidthHeight(totalVerticalThickness, 0)
        );
        break;
      case "both":
        this._scrollbarSize.setValue(
          Size2.givenWidthHeight(
            totalVerticalThickness,
            totalHorizontalThickness
          )
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
    const horizontalThumb = Observable.ofEmpty<Box2>(Box2.isEqual);
    const verticalThumb = Observable.ofEmpty<Box2>(Box2.isEqual);
    const areScrollTracksVisible = Observable.givenValue<boolean>(
      true,
      Observable.isStrictEqual
    );
    const isHovered = Observable.givenValue(false, Observable.isStrictEqual);

    const showScrollTracksLater = new Debounce({
      duration: Duration.givenSeconds(0.075),
      fn: () => {
        areScrollTracksVisible.setValue(true);
      },
    });

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

    const TrackAreaStyle = ElementStyle.givenDefinition({
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
          opacity: ${this.props.trackIdleOpacity ?? 0.25};
          transition: 0.3s ease opacity;
        `,
        isHovered: `
          opacity: ${this.props.trackHoverOpacity ?? 0.9};
        `,
      },
    });
    
    const trackArea = this.addActor(
      TrackAreaStyle.toManagedElement({
        tagName: "div",
        parentElement: wrapper.element,
      })
    );

    const horizontalScrollbarClassName = Observable.givenValue(
      HorizontalTrackStyle.toCombinedClassName()
    );
    const horizontalScrollbarCanvas = this.addActor(
      new ManagedCanvas({
        parentElement: trackArea.element,
        displaySize: horizontalTrackSize,
        renderEveryFrame: false,
        className: horizontalScrollbarClassName,
      })
    );

    const verticalScrollbarClassName = Observable.givenValue(
      VerticalTrackStyle.toCombinedClassName()
    );
    const verticalScrollbarCanvas = this.addActor(
      new ManagedCanvas({
        parentElement: trackArea.element,
        displaySize: verticalTrackSize,
        renderEveryFrame: false,
        className: verticalScrollbarClassName,
      })
    );

    this.cancelOnDeactivate(
      this._direction.didChange.subscribe((direction) => {
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
      }, true)
    );

    const wrapperSizeWatcher = this.addActor(
      new ElementSizeWatcher({
        element: wrapper.element,
      })
    );

    this._contentSizeWatcher = this.addActor(
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
      new MultiBinding({
        inputs: [wrapperSizeWatcher.output, this._contentSizeWatcher.output],
      })
    );

    this.cancelOnDeactivate(
      this._contentSizeWatcher.output.didChange.subscribe(
        (newContentSize, oldContentSize) => {
          if (oldContentSize == null) {
            return;
          }

          if (this._anchorBottom.value == false) {
            return;
          }

          const remainingContentBelow =
            oldContentSize.height -
            scrollPositionWatcher.position.value.y -
            this._scroller.element.offsetHeight;

          if (remainingContentBelow < anchorThreshold) {
            this._scroller.element.scrollTo(0, newContentSize.height);
          }
        }
      )
    );

    this.cancelOnDeactivate(
      sizeBinding.didInvalidate.subscribe(() => {
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
        } else if (isHorizontalVisible) {
          this._overflowDirection.setValue("horizontal");
        } else if (isVerticalVisible) {
          this._overflowDirection.setValue("vertical");
        } else {
          this._overflowDirection.setValue("none");
        }

        horizontalScrollbarClassName.setValue(
          HorizontalTrackStyle.toCombinedClassName(
            isHorizontalVisible ? "isVisible" : ""
          )
        );
        verticalScrollbarClassName.setValue(
          VerticalTrackStyle.toCombinedClassName(
            isVerticalVisible ? "isVisible" : ""
          )
        );

        const sizeOffset = isBothVisible ? 6 : 0;

        horizontalTrackSize.setValue(
          Size2.givenWidthHeight(
            wrapperSize.width - sizeOffset,
            this._scrollbarSize.value.height
          )
        );

        verticalTrackSize.setValue(
          Size2.givenWidthHeight(
            this._scrollbarSize.value.width,
            wrapperSize.height - sizeOffset
          )
        );

        horizontalScrollbarCanvas.needsRender();
        verticalScrollbarCanvas.needsRender();
      }, true)
    );

    this.cancelOnDeactivate(
      horizontalScrollbarCanvas.addRenderer(0, (params) => {
        const { context } = params;

        if (horizontalThumb.value == null) {
          return;
        }

        drawRoundRect(
          context,
          horizontalThumb.value,
          this._horizontalTrackSize.thumbRadius
        );

        context.fillStyle = this._scrollPositionColor.value.toHexString();
        context.fill();
      })
    );

    this.cancelOnDeactivate(
      verticalScrollbarCanvas.addRenderer(0, (params) => {
        const { context } = params;

        if (verticalThumb.value == null) {
          return;
        }

        drawRoundRect(
          context,
          verticalThumb.value,
          this._verticalTrackSize.thumbRadius
        );

        context.fillStyle = this._scrollPositionColor.value.toHexString();
        context.fill();
      })
    );

    const contentSizeBinding = this.addActor(
      new MultiBinding({ inputs: [this._contentArea, this._overflowDirection] })
    );

    this.cancelOnDeactivate(
      contentSizeBinding.didInvalidate.subscribe(() => {
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
      }, true)
    );

    const thumbBinding = this.addActor(
      new MultiBinding({inputs: [
        scrollPositionWatcher.position,
        wrapperSizeWatcher.output,
        this._contentSizeWatcher.output,
        horizontalTrackSize,
        verticalTrackSize,
      ]})
    );

    this.cancelOnDeactivate(
      thumbBinding.didInvalidate.subscribe(() => {
        const visibleLengthX = wrapperSizeWatcher.output.value.width;
        const visibleLengthY = wrapperSizeWatcher.output.value.height;

        const contentLengthX = this._contentSizeWatcher.output.value.width;
        const contentLengthY = this._contentSizeWatcher.output.value.height;

        if (visibleLengthX < contentLengthX) {
          const trackLengthX =
            horizontalTrackSize.value.width -
            this._horizontalTrackSize.leadingPadding -
            this._horizontalTrackSize.trailingPadding;

          const scrollPositionX = scrollPositionWatcher.position.value.x;
          const visibleStartPercent = scrollPositionX / contentLengthX;
          const visibleEndPercent =
            (scrollPositionX + visibleLengthX) / contentLengthX;

          horizontalThumb.setValue(
            Box2.givenOppositeCorners(
              Point2.givenXY(
                this._horizontalTrackSize.leadingPadding +
                  visibleStartPercent * trackLengthX,
                this._horizontalTrackSize.innerPadding
              ),
              Point2.givenXY(
                this._horizontalTrackSize.leadingPadding +
                  visibleEndPercent * trackLengthX,
                this._horizontalTrackSize.innerPadding + this._thumbWidth
              )
            )
          );
        }

        if (visibleLengthY < contentLengthY) {
          const trackLengthY =
            verticalTrackSize.value.height -
            this._verticalTrackSize.leadingPadding -
            this._verticalTrackSize.trailingPadding;

          const scrollPositionY = scrollPositionWatcher.position.value.y;
          const visibleStartPercentY = scrollPositionY / contentLengthY;
          const visibleEndPercentY =
            (scrollPositionY + visibleLengthY) / contentLengthY;

          verticalThumb.setValue(
            Box2.givenOppositeCorners(
              Point2.givenXY(
                this._verticalTrackSize.innerPadding,
                this._verticalTrackSize.leadingPadding +
                  visibleStartPercentY * trackLengthY
              ),
              Point2.givenXY(
                this._verticalTrackSize.innerPadding + this._thumbWidth,
                this._verticalTrackSize.leadingPadding +
                  visibleEndPercentY * trackLengthY
              )
            )
          );
        } else {
          verticalThumb.setValue(undefined);
        }
      }, true)
    );

    this.cancelOnDeactivate(
      horizontalThumb.didChange.subscribe(() => {
        horizontalScrollbarCanvas.needsRender();
      }, true)
    );

    this.cancelOnDeactivate(
      verticalThumb.didChange.subscribe(() => {
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
      wrapper.addManagedEventListener("pointerdown", () => {
        if (this._overflowDirection.value === "none") {
          return;
        }

        ScrollArea.willScroll.emit(this);
      })
    );

    this.addActor(
      new DragHorizontal({
        canvas: horizontalScrollbarCanvas.managedElement,
        scrollElement: this._scroller.element,
        trackSize: horizontalTrackSize,
        thumb: horizontalThumb,
      })
    );

    this.addActor(
      new DragVertical({
        canvas: verticalScrollbarCanvas.managedElement,
        scrollElement: this._scroller.element,
        trackSize: verticalTrackSize,
        thumb: verticalThumb,
      })
    );

    const trackAreaBinding = this.addActor(
      new MultiBinding({ inputs: [isHovered, areScrollTracksVisible] })
    );

    this.cancelOnDeactivate(
      trackAreaBinding.didInvalidate.subscribe(() => {
        if (areScrollTracksVisible.value == true) {
          trackArea.setModifier("isVisible", true);
          trackArea.setModifier("isHovered", isHovered.value);
          horizontalScrollbarCanvas.needsRender();
          verticalScrollbarCanvas.needsRender();
        } else {
          trackArea.setModifier("isVisible", false);
          trackArea.setModifier("isHovered", false);
        }
      }, true)
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  elementDescription: "Wrapper",
  css: `
    left: 0;
    position: absolute;
    top: 0;
    width: 100%;
    height: 100%;
  `,
});

const Scroller = ElementStyle.givenDefinition({
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

const ContentStyle = ElementStyle.givenDefinition({
  elementDescription: "Content",
  css: `
    position: absolute;
    display: flex;
  `,
});


const HorizontalTrackStyle = ElementStyle.givenDefinition({
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

const VerticalTrackStyle = ElementStyle.givenDefinition({
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
