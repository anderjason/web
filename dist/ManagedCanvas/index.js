"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedCanvas = void 0;
const geometry_1 = require("@anderjason/geometry");
const skytree_1 = require("skytree");
const ManagedElement_1 = require("../ManagedElement");
const observable_1 = require("@anderjason/observable");
const EveryFrame_1 = require("../EveryFrame");
const util_1 = require("@anderjason/util");
class ManagedCanvas extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._pixelSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this._renderers = observable_1.ObservableArray.ofEmpty();
        this._needsRender = observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual);
        this.displaySize = observable_1.ReadOnlyObservable.givenObservable(this.props.size);
        this.pixelSize = observable_1.ReadOnlyObservable.givenObservable(this._pixelSize);
    }
    get context() {
        return this.element.getContext("2d");
    }
    get element() {
        return this._canvas.element;
    }
    addRenderer(fn, timing) {
        const thisRenderer = {
            render: fn,
            timing,
        };
        let renderers = [
            ...this._renderers.toValues(),
            thisRenderer,
        ];
        renderers = util_1.ArrayUtil.arrayWithOrderFromValue(renderers, (r) => r.timing, "ascending");
        this._renderers.sync(renderers);
        return new observable_1.Receipt(() => {
            this._renderers.removeValue(thisRenderer);
        });
    }
    onActivate() {
        this._canvas = this.addActor(ManagedElement_1.ManagedElement.givenDefinition({
            tagName: "canvas",
            parentElement: this.props.parentElement,
        }));
        this.cancelOnDeactivate(new observable_1.Receipt(() => {
            this._renderers.clear();
        }));
        this.cancelOnDeactivate(this._renderers.didChange.subscribe(() => {
            this.render();
        }));
        this.cancelOnDeactivate(this._needsRender.didChange.subscribe((needsUpdate) => {
            if (needsUpdate == true) {
                requestAnimationFrame(() => {
                    this.render();
                });
            }
        }));
        const devicePixelRatio = window.devicePixelRatio || 1;
        this.cancelOnDeactivate(this.props.size.didChange.subscribe((size) => {
            if (size == null) {
                return;
            }
            if (this.props.parentElement.value == null) {
                return;
            }
            const newPixelSize = geometry_1.Size2.givenWidthHeight(size.width * devicePixelRatio, size.height * devicePixelRatio);
            this._pixelSize.setValue(newPixelSize);
            this._canvas.element.width = newPixelSize.width;
            this._canvas.element.height = newPixelSize.height;
            this._canvas.style.width = `${size.width}px`;
            this._canvas.style.height = `${size.height}px`;
            this.render();
        }, true));
        const renderEveryFrame = observable_1.Observable.givenValueOrObservable(this.props.renderEveryFrame || false);
        this.addActor(new skytree_1.ConditionalActivator({
            input: renderEveryFrame,
            fn: (v) => v,
            actor: new EveryFrame_1.EveryFrame({
                callback: () => {
                    this.render();
                },
            }),
        }));
    }
    needsRender() {
        this._needsRender.setValue(true);
    }
    render() {
        this._needsRender.setValue(false);
        const context = this._canvas.element.getContext("2d");
        const pixelSize = this.pixelSize.value;
        const displaySize = this.displaySize.value;
        context.clearRect(0, 0, pixelSize.width, pixelSize.height);
        this._renderers.forEach((renderer) => {
            renderer.render(context, pixelSize, displaySize);
        });
    }
}
exports.ManagedCanvas = ManagedCanvas;
//# sourceMappingURL=index.js.map