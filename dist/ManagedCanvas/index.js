"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ManagedCanvas = void 0;
const geometry_1 = require("@anderjason/geometry");
const skytree_1 = require("skytree");
const web_1 = require("@anderjason/web");
class ManagedCanvas extends skytree_1.Actor {
    get context() {
        return this._context;
    }
    get element() {
        return this._canvas.element;
    }
    onActivate() {
        this._canvas = this.addActor(web_1.ManagedElement.givenDefinition({
            tagName: "canvas",
            parentElement: this.props.parentElement,
        }));
        this._context = this._canvas.element.getContext("2d");
        const devicePixelRatio = window.devicePixelRatio || 1;
        this.cancelOnDeactivate(this.props.size.didChange.subscribe((size) => {
            if (size == null) {
                return;
            }
            if (this.props.parentElement.value == null) {
                return;
            }
            const newSize = geometry_1.Size2.givenWidthHeight(size.width * devicePixelRatio, size.height * devicePixelRatio);
            this._canvas.element.width = newSize.width;
            this._canvas.element.height = newSize.height;
            this._canvas.style.width = `${size.width}px`;
            this._canvas.style.height = `${size.height}px`;
        }, true));
    }
}
exports.ManagedCanvas = ManagedCanvas;
//# sourceMappingURL=index.js.map