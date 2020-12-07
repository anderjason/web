import { Actor, MultiBinding } from "skytree";
import { ElementStyle } from "../ElementStyle";
import { Observable, ObservableBase } from "@anderjason/observable";
import { DynamicStyleElement, ElementSizeWatcher, ScrollArea } from "..";
import { Color } from "@anderjason/color";

export interface VerticalExpanderProps {
  parentElement: HTMLElement;
  isExpanded: Observable<boolean>;

  maxHeight?: number | Observable<number>;
}

export class VerticalExpander extends Actor<VerticalExpanderProps> {
  private _content: DynamicStyleElement<HTMLDivElement>;
  private _maxHeight: ObservableBase<number>;

  constructor(props: VerticalExpanderProps) {
    super(props);

    this._maxHeight = Observable.givenValueOrObservable(this.props.maxHeight);
  }

  get element(): HTMLDivElement {
    return this._content.element;
  }

  onActivate() {
    const wrapper = this.addActor(
      WrapperStyle.toManagedElement({
        tagName: "div",
        parentElement: this.props.parentElement,
      })
    );

    const scrollArea = this.addActor(
      new ScrollArea({
        parentElement: wrapper.element,
        scrollPositionColor: Color.givenHexString("#999999"),
        direction: "vertical",
      })
    );

    this._content = this.addActor(
      ContentStyle.toManagedElement({
        tagName: "div",
        parentElement: scrollArea.element,
      })
    );

    const contentSize = this.addActor(
      new ElementSizeWatcher({
        element: this._content.element,
      })
    );

    const heightBinding = this.addActor(
      MultiBinding.givenAnyChange([
        contentSize.output,
        this.props.isExpanded,
        this._maxHeight,
      ])
    );

    this.cancelOnDeactivate(
      heightBinding.didInvalidate.subscribe(() => {
        const size = contentSize.output.value;
        const isExpanded = this.props.isExpanded.value;
        const maxHeight = this._maxHeight.value;

        if (size == null) {
          return;
        }

        if (isExpanded == true) {
          let height = size.height;
          if (maxHeight != null) {
            height = Math.min(maxHeight, height);
          }

          wrapper.style.height = `${height}px`;
        } else {
          wrapper.style.height = "0";
        }
      }, true)
    );
  }
}

const WrapperStyle = ElementStyle.givenDefinition({
  css: `
    transition: 0.4s ease height;
    position: relative;
    width: 100%;
    overflow: hidden;
  `,
});

const ContentStyle = ElementStyle.givenDefinition({
  css: `
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
  `,
});
