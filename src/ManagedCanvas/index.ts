import { Size2 } from "@anderjason/geometry";
import { Actor, ConditionalActivator } from "skytree";
import { ManagedElement } from "@anderjason/web";
import {
  Observable,
  ObservableArray,
  ObservableBase,
  ReadOnlyObservable,
} from "@anderjason/observable";
import { EveryFrame } from "..";

export interface ManagedCanvasProps {
  parentElement: Observable<HTMLElement>;
  size: ObservableBase<Size2>;

  renderEveryFrame?: boolean | Observable<boolean>;
}

export type ManagedCanvasRenderer = (
  context: CanvasRenderingContext2D,
  pixelSize: Size2
) => void;

export class ManagedCanvas extends Actor<ManagedCanvasProps> {
  private _canvas: ManagedElement<HTMLCanvasElement>;

  get context(): CanvasRenderingContext2D {
    return this.element.getContext("2d");
  }

  get element(): HTMLCanvasElement {
    return this._canvas.element;
  }

  private _pixelSize = Observable.ofEmpty<Size2>(Size2.isEqual);

  readonly displaySize: ReadOnlyObservable<Size2>;
  readonly pixelSize: ReadOnlyObservable<Size2>;
  readonly renderers = ObservableArray.ofEmpty<ManagedCanvasRenderer>();

  constructor(props: ManagedCanvasProps) {
    super(props);

    this.displaySize = ReadOnlyObservable.givenObservable(this.props.size);
    this.pixelSize = ReadOnlyObservable.givenObservable(this._pixelSize);
  }

  onActivate() {
    this._canvas = this.addActor(
      ManagedElement.givenDefinition({
        tagName: "canvas",
        parentElement: this.props.parentElement,
      })
    );

    const devicePixelRatio = window.devicePixelRatio || 1;

    this.cancelOnDeactivate(
      this.props.size.didChange.subscribe((size) => {
        if (size == null) {
          return;
        }

        if (this.props.parentElement.value == null) {
          return;
        }

        const newPixelSize = Size2.givenWidthHeight(
          size.width * devicePixelRatio,
          size.height * devicePixelRatio
        );

        this._pixelSize.setValue(newPixelSize);

        this._canvas.element.width = newPixelSize.width;
        this._canvas.element.height = newPixelSize.height;
        this._canvas.style.width = `${size.width}px`;
        this._canvas.style.height = `${size.height}px`;

        this.render();
      }, true)
    );

    const renderEveryFrame = Observable.givenValueOrObservable<boolean>(
      this.props.renderEveryFrame || false
    );

    this.addActor(
      new ConditionalActivator({
        input: renderEveryFrame,
        fn: (v) => v,
        actor: new EveryFrame({
          callback: () => {
            this.render();
          },
        }),
      })
    );
  }

  render() {
    const context = this._canvas.element.getContext("2d")!;
    const pixelSize = this.pixelSize.value;

    this.renderers.forEach((renderFn) => {
      renderFn(context, pixelSize);
    });
  }
}
