"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedCanvas = void 0;
const geometry_1 = require("@anderjason/geometry");
const skytree_1 = require("skytree");
const web_1 = require("@anderjason/web");
const observable_1 = require("@anderjason/observable");
const __1 = require("..");
class ManagedCanvas extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._pixelSize = observable_1.Observable.ofEmpty(geometry_1.Size2.isEqual);
        this.renderers = observable_1.ObservableArray.ofEmpty();
        this.displaySize = observable_1.ReadOnlyObservable.givenObservable(this.props.size);
        this.pixelSize = observable_1.ReadOnlyObservable.givenObservable(this._pixelSize);
    }
    get context() {
        return this.element.getContext("2d");
    }
    get element() {
        return this._canvas.element;
    }
    onActivate() {
        this._canvas = this.addActor(web_1.ManagedElement.givenDefinition({
            tagName: "canvas",
            parentElement: this.props.parentElement,
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
            actor: new __1.EveryFrame({
                callback: () => {
                    this.render();
                },
            }),
        }));
    }
    render() {
        const context = this._canvas.element.getContext("2d");
        const pixelSize = this.pixelSize.value;
        context.clearRect(0, 0, pixelSize.width, pixelSize.height);
        this.renderers.forEach((renderFn) => {
            renderFn(context, pixelSize);
        });
    }
}
exports.ManagedCanvas = ManagedCanvas;
//# sourceMappingURL=index.js.map