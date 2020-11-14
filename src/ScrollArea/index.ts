import { Color } from "@anderjason/color";
import { Size2 } from "@anderjason/geometry";
import {
  Observable,
  ObservableBase,
  ReadOnlyObservable,
} from "@anderjason/observable";
import { Percent } from "@anderjason/util";
import { ManagedElement } from "../ManagedElement";
import { ElementStyle } from "../ElementStyle";
import { Actor } from "skytree";

export type ScrollDirection = "none" | "vertical" | "horizontal" | "both";

export interface ScrollAreaProps {
  parentElement: HTMLElement | Observable<HTMLElement>;
  direction: ScrollDirection | ObservableBase<ScrollDirection>;
  scrollPositionColor: Color | ObservableBase<Color>;

  backgroundColor?: Color;
}

const stylesByHexColor = new Map<string, ElementStyle>();
export function styleGivenHexColor(color: Color): ElementStyle {
  const hexColor = color.toHexString();
  if (!stylesByHexColor.has(hexColor)) {
    const hexColorIdle = color
      .withAlpha(Percent.givenFraction(0.2, 1))
      .toHexString();

    const result = ElementStyle.givenDefinition({
      elementDescription: "ScrollArea",
      css: `
        position: absolute;
        left: 0;
        top: 0;
        right: 0;
        bottom: 0;
        overflow: hidden;
        transition: 0.2s ease color;
        color: ${hexColorIdle};

        &:hover {
          color: ${hexColor};
        }

        &::-webkit-scrollbar {
          width: 22px;
          height: 22px;
          border-radius: 13px;
          background-clip: padding-box;
        }
    
        &::-webkit-scrollbar-corner {
          background: transparent;
        }

        &::-webkit-scrollbar-thumb {
          border-radius: 13px;
          background-clip: padding-box;
          border: 8px solid transparent;
          box-shadow: inset 0 0 0 10px;
        }
      `,
    });

    stylesByHexColor.set(hexColor, result);
  }

  return stylesByHexColor.get(hexColor);
}

export class ScrollArea extends Actor<ScrollAreaProps> {
  private _scrollbarSize = Observable.ofEmpty<Size2>();
  readonly scrollbarSize = ReadOnlyObservable.givenObservable(
    this._scrollbarSize
  );

  private _wrapper: ManagedElement<HTMLDivElement>;

  constructor(props: ScrollAreaProps) {
    super(props);

    switch (props.direction) {
      case "none":
        this._scrollbarSize.setValue(Size2.ofZero());
        break;
      case "horizontal":
        this._scrollbarSize.setValue(Size2.givenWidthHeight(0, 22));
        break;
      case "vertical":
        this._scrollbarSize.setValue(Size2.givenWidthHeight(22, 0));
        break;
      case "both":
        this._scrollbarSize.setValue(Size2.givenWidthHeight(22, 22));
        break;
    }
  }

  get element(): HTMLElement {
    return this._wrapper.element;
  }

  onActivate() {
    this._wrapper = this.addActor(
      ManagedElement.givenDefinition({
        tagName: "div",
        parentElement: this.props.parentElement,
      })
    );

    if (this.props.backgroundColor != null) {
      this._wrapper.style.backgroundColor = this.props.backgroundColor.toHexString();
    }

    let observableColor: ObservableBase<Color>;
    if (Observable.isObservable(this.props.scrollPositionColor)) {
      observableColor = this.props.scrollPositionColor;
    } else {
      observableColor = Observable.givenValue(this.props.scrollPositionColor);
    }

    this.cancelOnDeactivate(
      observableColor.didChange.subscribe((color) => {
        const elementStyle = styleGivenHexColor(color);

        if (elementStyle == null) {
          return;
        }

        this._wrapper.element.className = elementStyle.toCombinedClassName();
      }, true)
    );

    const onDirectionChanged = (direction: ScrollDirection) => {
      switch (direction) {
        case "none":
          this._wrapper.style.overflowX = "hidden";
          this._wrapper.style.overflowY = "hidden";
          break;
        case "vertical":
          this._wrapper.style.overflowX = "hidden";
          this._wrapper.style.overflowY = "scroll";
          break;
        case "horizontal":
          this._wrapper.style.overflowX = "scroll";
          this._wrapper.style.overflowY = "hidden";
          break;
        case "both":
          this._wrapper.style.overflowX = "scroll";
          this._wrapper.style.overflowY = "scroll";
          break;
        default:
          throw new Error("Unsupported direction");
      }
    };

    if (Observable.isObservable(this.props.direction)) {
      this.cancelOnDeactivate(
        this.props.direction.didChange.subscribe((direction) => {
          onDirectionChanged(direction);
        }, true)
      );
    } else {
      onDirectionChanged(this.props.direction);
    }
  }
}
