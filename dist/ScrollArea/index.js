"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ScrollArea = exports.styleGivenHexColor = void 0;
const geometry_1 = require("@anderjason/geometry");
const observable_1 = require("@anderjason/observable");
const util_1 = require("@anderjason/util");
const ManagedElement_1 = require("../ManagedElement");
const ElementStyle_1 = require("../ElementStyle");
const skytree_1 = require("skytree");
const stylesByHexColor = new Map();
function styleGivenHexColor(color) {
    const hexColor = color.toHexString();
    if (!stylesByHexColor.has(hexColor)) {
        const hexColorIdle = color
            .withAlpha(util_1.Percent.givenFraction(0.2, 1))
            .toHexString();
        const result = ElementStyle_1.ElementStyle.givenDefinition({
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
exports.styleGivenHexColor = styleGivenHexColor;
class ScrollArea extends skytree_1.Actor {
    constructor(props) {
        super(props);
        this._scrollbarSize = observable_1.Observable.ofEmpty();
        this.scrollbarSize = observable_1.ReadOnlyObservable.givenObservable(this._scrollbarSize);
        switch (props.direction) {
            case "none":
                this._scrollbarSize.setValue(geometry_1.Size2.ofZero());
                break;
            case "horizontal":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(0, 22));
                break;
            case "vertical":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(22, 0));
                break;
            case "both":
                this._scrollbarSize.setValue(geometry_1.Size2.givenWidthHeight(22, 22));
                break;
        }
    }
    get element() {
        return this._wrapper.element;
    }
    onActivate() {
        this._wrapper = this.addActor(ManagedElement_1.ManagedElement.givenDefinition({
            tagName: "div",
            parentElement: this.props.parentElement,
        }));
        if (this.props.backgroundColor != null) {
            this._wrapper.style.backgroundColor = this.props.backgroundColor.toHexString();
        }
        let observableColor;
        if (observable_1.Observable.isObservable(this.props.scrollPositionColor)) {
            observableColor = this.props.scrollPositionColor;
        }
        else {
            observableColor = observable_1.Observable.givenValue(this.props.scrollPositionColor);
        }
        this.cancelOnDeactivate(observableColor.didChange.subscribe((color) => {
            const elementStyle = styleGivenHexColor(color);
            if (elementStyle == null) {
                return;
            }
            this._wrapper.element.className = elementStyle.toCombinedClassName();
        }, true));
        const onDirectionChanged = (direction) => {
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
        if (observable_1.Observable.isObservable(this.props.direction)) {
            this.cancelOnDeactivate(this.props.direction.didChange.subscribe((direction) => {
                onDirectionChanged(direction);
            }, true));
        }
        else {
            onDirectionChanged(this.props.direction);
        }
    }
}
exports.ScrollArea = ScrollArea;
//# sourceMappingURL=index.js.map