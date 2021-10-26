"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VerticalExpander = void 0;
const skytree_1 = require("skytree");
const ElementStyle_1 = require("../ElementStyle");
const observable_1 = require("@anderjason/observable");
const __1 = require("..");
const color_1 = require("@anderjason/color");
class VerticalExpander extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._minHeight = observable_1.Observable.givenValueOrObservable(this.props.minHeight);
        this._maxHeight = observable_1.Observable.givenValueOrObservable(this.props.maxHeight);
    }
    get element() {
        return this._content.element;
    }
    onActivate() {
        const wrapper = this.addActor(WrapperStyle.toManagedElement({
            tagName: "div",
            parentElement: this.props.parentElement,
        }));
        const scrollArea = this.addActor(new __1.ScrollArea({
            parentElement: wrapper.element,
            scrollPositionColor: color_1.Color.givenHexString("#999999"),
            direction: "vertical",
        }));
        this._content = this.addActor(ContentStyle.toManagedElement({
            tagName: "div",
            parentElement: scrollArea.element,
        }));
        const contentSize = this.addActor(new __1.ElementSizeWatcher({
            element: this._content.element,
        }));
        const heightBinding = this.addActor(new skytree_1.MultiBinding({ inputs: [
                contentSize.output,
                this.props.isExpanded,
                this._maxHeight,
            ] }));
        this.cancelOnDeactivate(heightBinding.didInvalidate.subscribe(() => {
            const size = contentSize.output.value;
            const isExpanded = this.props.isExpanded.value;
            const minHeight = this._minHeight.value;
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
            }
            else {
                let height = 0;
                if (minHeight != null) {
                    height = Math.max(minHeight, height);
                }
                wrapper.style.height = `${height}px`;
            }
        }, true));
    }
}
exports.VerticalExpander = VerticalExpander;
const WrapperStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Wrapper",
    css: `
    transition: 0.4s cubic-bezier(.5,0,.3,1) height;
    position: relative;
    width: 100%;
    overflow: hidden;
  `,
});
const ContentStyle = ElementStyle_1.ElementStyle.givenDefinition({
    elementDescription: "Content",
    css: `
    left: 0;
    top: 0;
    width: 100%;
  `,
});
//# sourceMappingURL=index.js.map