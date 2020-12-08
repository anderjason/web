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
  parentElement: HTMLElement | Observable<HTMLElement>;
  displaySize: Size2 | ObservableBase<Size2>;
  renderEveryFrame: boolean | Observable<boolean>;

  className?: string;
}

export interface ManagedCanvasRenderParams {
  context: CanvasRenderingContext2D;
  pixelSize: Size2;
  displaySize: Size2;
  devicePixelRatio: number;
}

export type ManagedCanvasRenderFunction = (
  params: ManagedCanvasRenderParams
) => void;

interface ManagedCanvasRenderer {
  render: ManagedCanvasRenderFunction;
  renderOrder: number;
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
  private _parentElement: ObservableBase<HTMLElement>;
  private _displaySize: ObservableBase<Size2>;

  readonly displaySize: ReadOnlyObservable<Size2>;
  readonly pixelSize: ReadOnlyObservable<Size2>;

  constructor(props: ManagedCanvasProps) {
    super(props);

    this._displaySize = Observable.givenValueOrObservable(
      this.props.displaySize
    );

    this.displaySize = ReadOnlyObservable.givenObservable(this._displaySize);
    this.pixelSize = ReadOnlyObservable.givenObservable(this._pixelSize);
    this._parentElement = Observable.givenValueOrObservable(
      this.props.parentElement
    );
  }

  addRenderer(
    renderOrder: number,
    render: ManagedCanvasRenderFunction
  ): Receipt {
    const thisRenderer: ManagedCanvasRenderer = {
      render,
      renderOrder,
    };

    let renderers: ManagedCanvasRenderer[] = [
      ...this._renderers.toValues(),
      thisRenderer,
    ];

    renderers = ArrayUtil.arrayWithOrderFromValue(
      renderers,
      (r) => r.renderOrder,
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

    if (this.props.className != null) {
      this._canvas.element.className = this.props.className;
    }

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
      this._displaySize.didChange.subscribe((displaySize) => {
        if (displaySize == null) {
          return;
        }

        if (this._parentElement.value == null) {
          return;
        }

        const newPixelSize = Size2.givenWidthHeight(
          displaySize.width * devicePixelRatio,
          displaySize.height * devicePixelRatio
        );

        this._pixelSize.setValue(newPixelSize);

        this._canvas.element.width = newPixelSize.width;
        this._canvas.element.height = newPixelSize.height;
        this._canvas.style.width = `${displaySize.width}px`;
        this._canvas.style.height = `${displaySize.height}px`;

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
          fn: () => {
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

    const renderParams = {
      context,
      pixelSize,
      displaySize,
      devicePixelRatio: window.devicePixelRatio || 1,
    };

    this._renderers.forEach((renderer) => {
      renderer.render(renderParams);
    });
  }
}
