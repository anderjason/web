import { Size2 } from "@anderjason/geometry";
import { Actor, ConditionalActivator } from "skytree";
import { ManagedElement } from "../ManagedElement";
import {
  Observable,
  ObservableArray,
  ObservableBase,
  ReadOnlyObservable,
  Receipt,
} from "@anderjason/observable";
import { EveryFrame } from "../EveryFrame";
import { ArrayUtil } from "@anderjason/util";

export interface ManagedCanvasProps {
  parentElement: Observable<HTMLElement>;
  size: ObservableBase<Size2>; // TODO change to displaySize

  renderEveryFrame?: boolean | Observable<boolean>;
}

export type ManagedCanvasRenderFunction = (
  context: CanvasRenderingContext2D,
  pixelSize: Size2,
  displaySize: Size2
) => void;

interface ManagedCanvasRenderer {
  render: ManagedCanvasRenderFunction;
  timing: number;
}

export class ManagedCanvas extends Actor<ManagedCanvasProps> {
  private _canvas: ManagedElement<HTMLCanvasElement>;

  get context(): CanvasRenderingContext2D {
    return this.element.getContext("2d");
  }

  get element(): HTMLCanvasElement {
    return this._canvas.element;
  }

  private _pixelSize = Observable.ofEmpty<Size2>(Size2.isEqual);
  private _renderers = ObservableArray.ofEmpty<ManagedCanvasRenderer>();
  private _needsRender = Observable.ofEmpty<boolean>(Observable.isStrictEqual);

  readonly displaySize: ReadOnlyObservable<Size2>;
  readonly pixelSize: ReadOnlyObservable<Size2>;

  constructor(props: ManagedCanvasProps) {
    super(props);

    this.displaySize = ReadOnlyObservable.givenObservable(this.props.size);
    this.pixelSize = ReadOnlyObservable.givenObservable(this._pixelSize);
  }

  addRenderer(fn: ManagedCanvasRenderFunction, timing: number): Receipt {
    const thisRenderer = {
      render: fn,
      timing,
    };

    let renderers: ManagedCanvasRenderer[] = [
      ...this._renderers.toValues(),
      thisRenderer,
    ];

    renderers = ArrayUtil.arrayWithOrderFromValue(
      renderers,
      (r) => r.timing,
      "ascending"
    );

    this._renderers.sync(renderers);

    return new Receipt(() => {
      this._renderers.removeValue(thisRenderer);
    });
  }

  onActivate() {
    this._canvas = this.addActor(
      ManagedElement.givenDefinition({
        tagName: "canvas",
        parentElement: this.props.parentElement,
      })
    );

    this.cancelOnDeactivate(
      new Receipt(() => {
        this._renderers.clear();
      })
    );

    this.cancelOnDeactivate(
      this._renderers.didChange.subscribe(() => {
        this.render();
      })
    );

    this.cancelOnDeactivate(
      this._needsRender.didChange.subscribe((needsUpdate) => {
        if (needsUpdate == true) {
          requestAnimationFrame(() => {
            this.render();
          });
        }
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

  needsRender() {
    this._needsRender.setValue(true);
  }

  private render() {
    this._needsRender.setValue(false);

    const context = this._canvas.element.getContext("2d")!;
    const pixelSize = this.pixelSize.value;
    const displaySize = this.displaySize.value;

    context.clearRect(0, 0, pixelSize.width, pixelSize.height);

    this._renderers.forEach((renderer) => {
      renderer.render(context, pixelSize, displaySize);
    });
  }
}
