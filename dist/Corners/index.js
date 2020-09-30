"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Corners = void 0;
const geometry_1 = require("@anderjason/geometry");
const cornersGivenContainedPoints_1 = require("./_internal/cornersGivenContainedPoints");
class Corners {
    constructor(leftTop, rightTop, rightBottom, leftBottom) {
        this.leftTop = leftTop;
        this.rightTop = rightTop;
        this.rightBottom = rightBottom;
        this.leftBottom = leftBottom;
    }
    static givenBox(box) {
        return new Corners(box.toLeftTop(), box.toRightTop(), box.toRightBottom(), box.toLeftBottom());
    }
    static givenContainedPoints(points) {
        return cornersGivenContainedPoints_1.cornersGivenContainedPoints(points);
    }
    static givenCornerPoints(leftTop, rightTop, rightBottom, leftBottom) {
        return new Corners(leftTop, rightTop, rightBottom, leftBottom);
    }
    static isEqual(a, b) {
        if (a == null && b == null) {
            return true;
        }
        if (a == null || b == null) {
            return false;
        }
        return a.isEqual(b);
    }
    isEqual(other) {
        if (other == null) {
            return false;
        }
        if (!(other instanceof Corners)) {
            return false;
        }
        return (this.leftTop.isEqual(other.leftTop) &&
            this.rightTop.isEqual(other.rightTop) &&
            this.rightBottom.isEqual(other.rightBottom) &&
            this.leftBottom.isEqual(other.leftBottom));
    }
    isSizeEqual(other, fuzzy = 10) {
        if (other == null) {
            throw new Error("other is required");
        }
        const otherSize = other.toSize();
        const thisSize = this.toSize();
        const differenceX = Math.abs(otherSize.width - thisSize.width);
        const differenceY = Math.abs(otherSize.height - thisSize.height);
        return differenceX < fuzzy && differenceY < fuzzy;
    }
    toSize() {
        if (this._size == null) {
            const topWidth = this.leftTop.toDistance(this.rightTop);
            const bottomWidth = this.leftBottom.toDistance(this.rightBottom);
            const leftHeight = this.leftTop.toDistance(this.leftBottom);
            const rightHeight = this.rightTop.toDistance(this.rightBottom);
            const width = (topWidth + bottomWidth) / 2;
            const height = (leftHeight + rightHeight) / 2;
            this._size = geometry_1.Size2.givenWidthHeight(width, height);
        }
        return this._size;
    }
    withTransform(transform) {
        if (transform == null) {
            throw new Error("transform is required");
        }
        return new Corners(transform.toTransformedPoint(this.leftTop), transform.toTransformedPoint(this.rightTop), transform.toTransformedPoint(this.rightBottom), transform.toTransformedPoint(this.leftBottom));
    }
}
exports.Corners = Corners;
//# sourceMappingURL=index.js.map