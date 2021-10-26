"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Transform = exports.matrix3dOfIdentity = void 0;
const geometry_1 = require("@anderjason/geometry");
const matrixTransformGivenCorners_1 = require("./_internal/matrixTransformGivenCorners");
function vectorWithAppliedVectors(input, a, b) {
    const vectorA = a.withMultipliedScalar(input.x);
    const vectorB = b.withMultipliedScalar(input.y);
    return vectorA.withAddedVector(vectorB);
}
function matrix3dOfIdentity() {
    let matrix = [];
    for (let i = 0; i < 16; i++) {
        i % 5 == 0 ? matrix.push(1) : matrix.push(0);
    }
    return matrix;
}
exports.matrix3dOfIdentity = matrix3dOfIdentity;
function matrix3dGivenNumbers(source) {
    if (source == null) {
        return undefined;
    }
    if (source && source.constructor === Array) {
        let values = source
            .filter((value) => typeof value === "number")
            .filter((value) => !isNaN(value));
        if (source.length === 6 && values.length === 6) {
            let matrix = matrix3dOfIdentity();
            matrix[0] = values[0];
            matrix[1] = values[1];
            matrix[4] = values[2];
            matrix[5] = values[3];
            matrix[12] = values[4];
            matrix[13] = values[5];
            return matrix;
        }
        else if (source.length === 16 && values.length === 16) {
            return source;
        }
    }
    throw new TypeError(`Expected a number[] with length 6 or 16, but got '${source}'`);
}
class Transform {
    constructor(matrix3d) {
        this.isEqual = (other) => {
            if (other == null) {
                return false;
            }
            if (!(other instanceof Transform)) {
                return false;
            }
            return this.matrix3d.every((number, idx) => {
                return other.matrix3d[idx] === number;
            });
        };
        if (matrix3d == null) {
            throw new Error("Matrix is required");
        }
        this.matrix3d = matrix3d;
    }
    static givenCssMatrixTransform(source) {
        if (typeof source === "string") {
            let match = source.match(/matrix(3d)?\(([^)]+)\)/);
            if (match) {
                let raw = match[2].split(", ").map(parseFloat);
                const matrix3d = matrix3dGivenNumbers(raw);
                return new Transform(matrix3d);
            }
        }
        throw new Error("Could not create Transform from CSS matrix transform string");
    }
    static givenMatrix3D(input) {
        return new Transform(input);
    }
    static givenCornersAndSize(corners, size) {
        const matrix3d = matrix3dGivenNumbers((0, matrixTransformGivenCorners_1.matrixTransformGivenCorners)(corners, size));
        if (matrix3d == null) {
            return undefined;
        }
        return new Transform(matrix3d);
    }
    static givenScale(scale) {
        return new Transform(matrix3dGivenNumbers([scale.width, 0, 0, scale.height, 0, 0]));
    }
    static givenPoints(source1, source2, destination1, destination2, rotate) {
        const vSource1 = geometry_1.Vector2.givenPoint(source1);
        const vSource2 = geometry_1.Vector2.givenPoint(source2);
        const vDest1 = geometry_1.Vector2.givenPoint(destination1);
        const vDest2 = geometry_1.Vector2.givenPoint(destination2);
        // Source vector.
        const a = vSource2.withSubtractedVector(vSource1);
        // Destination vector.
        const b = vDest2.withSubtractedVector(vDest1);
        let x;
        let y;
        if (rotate) {
            const alen = a.toDotProduct(a);
            const sig = a.toDotProduct(b);
            const del = a.x * b.y - a.y * b.x;
            x = sig / alen;
            y = del / alen;
        }
        else {
            const alen = Math.sqrt(a.toDotProduct(a));
            const blen = Math.sqrt(a.toDotProduct(b));
            const scale = blen / alen;
            x = scale;
            y = 0;
        }
        const rotateScaleA = geometry_1.Vector2.givenXY(x, y);
        const rotateScaleB = geometry_1.Vector2.givenXY(-y, x);
        // Position of source1 if rotation is applied.
        const vectorA = rotateScaleA.withMultipliedScalar(vSource1.x);
        const vectorB = rotateScaleB.withMultipliedScalar(vSource1.y);
        const rs0 = vectorA.withAddedVector(vectorB);
        // Since d[0] = rs0 + t
        const t = vDest1.withSubtractedVector(rs0);
        const matrix = [
            rotateScaleA.x,
            rotateScaleA.y,
            0,
            0,
            rotateScaleB.x,
            rotateScaleB.y,
            0,
            0,
            0,
            0,
            0,
            0,
            t.x,
            t.y,
            0,
            0,
        ];
        return new Transform(matrix);
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
    get is2d() {
        return this.matrix3d[2] === 0 && this.matrix3d[3] === 0;
    }
    toTranslation() {
        const e = this.matrix3d[12];
        const f = this.matrix3d[13];
        return geometry_1.Point2.givenXY(e, f);
    }
    toCssTranslation() {
        const translation = this.toTranslation();
        return `translate(${translation.x}px, ${translation.y}px)`;
    }
    toRotation() {
        const a = this.matrix3d[0];
        const b = this.matrix3d[1];
        const c = this.matrix3d[4];
        const d = this.matrix3d[5];
        if (a != 0 || b != 0) {
            const r = Math.sqrt(a * a + b * b);
            const radians = b > 0 ? Math.acos(a / r) : -Math.acos(a / r);
            return geometry_1.Rotation.givenRadians(radians);
        }
        else if (c != 0 || d != 0) {
            const s = Math.sqrt(c * c + d * d);
            const radians = Math.PI / 2 - (d > 0 ? Math.acos(-c / s) : -Math.acos(c / s));
            return geometry_1.Rotation.givenRadians(radians);
        }
        else {
            return geometry_1.Rotation.givenDegrees(0);
        }
    }
    toCssRotation() {
        const rotation = this.toRotation();
        return `rotate(${rotation.toDegrees()}deg)`;
    }
    toScale() {
        const a = this.matrix3d[0];
        const b = this.matrix3d[1];
        const c = this.matrix3d[4];
        const d = this.matrix3d[5];
        const delta = a * d - b * c;
        if (a != 0 || b != 0) {
            const r = Math.sqrt(a * a + b * b);
            return geometry_1.Size2.givenWidthHeight(r, delta / r);
        }
        else if (c != 0 || d != 0) {
            const s = Math.sqrt(c * c + d * d);
            return geometry_1.Size2.givenWidthHeight(delta / s, s);
        }
        else {
            // a = b = c = d = 0
            return geometry_1.Size2.ofZero();
        }
    }
    toCssScale() {
        const scale = this.toScale();
        return `scale(${scale.width}, ${scale.height})`;
    }
    toSkewX() {
        const a = this.matrix3d[0];
        const b = this.matrix3d[1];
        const c = this.matrix3d[4];
        const d = this.matrix3d[5];
        if (a != 0 || b != 0) {
            const r = Math.sqrt(a * a + b * b);
            const radians = Math.atan((a * c + b * d) / (r * r));
            return geometry_1.Rotation.givenRadians(radians);
        }
        else {
            return geometry_1.Rotation.ofZero();
        }
    }
    toSkewY() {
        const a = this.matrix3d[0];
        const b = this.matrix3d[1];
        const c = this.matrix3d[4];
        const d = this.matrix3d[5];
        if (a != 0 || b != 0) {
            return geometry_1.Rotation.ofZero();
        }
        else if (c != 0 || d != 0) {
            const s = Math.sqrt(c * c + d * d);
            const radians = Math.atan((a * c + b * d) / (s * s));
            return geometry_1.Rotation.givenRadians(radians);
        }
        else {
            return geometry_1.Rotation.ofZero();
        }
    }
    toCssSkew() {
        const skewX = this.toSkewX();
        const skewY = this.toSkewY();
        return `skew(${skewX.toDegrees()}deg, ${skewY.toDegrees()}deg)`;
    }
    toCssMatrixTransform() {
        return `matrix3d(${this.matrix3d.join(", ")})`;
    }
    toCssCombinedTransform() {
        const parts = [
            this.toCssTranslation(),
            this.toCssRotation(),
            this.toCssScale(),
            this.toCssSkew(),
        ];
        return parts.join(" ");
    }
    toTranslateVector() {
        const e = this.matrix3d[12];
        const f = this.matrix3d[13];
        return geometry_1.Vector2.givenXY(e, f);
    }
    toVectors() {
        return [
            geometry_1.Vector2.givenXY(this.matrix3d[0], this.matrix3d[1]),
            geometry_1.Vector2.givenXY(this.matrix3d[4], this.matrix3d[5]),
        ];
    }
    toTransformedPoint(input) {
        const inVertex = [input.x, input.y, 0, 1];
        const outVertex = [0, 0, 0, 0];
        for (let col = 0; col < 4; ++col) {
            let sum = 0;
            for (let row = 0; row < 4; ++row) {
                sum += this.matrix3d[row * 4 + col] * inVertex[row];
            }
            outVertex[col] = sum;
        }
        for (let i = 0; i < 4; ++i) {
            outVertex[i] = outVertex[i] / outVertex[3];
        }
        return geometry_1.Point2.givenXY(outVertex[0], outVertex[1]);
    }
    withCascade(other) {
        const [otherA, otherB] = other.toVectors();
        const [thisA, thisB] = this.toVectors();
        const resultA = vectorWithAppliedVectors(otherA, thisA, thisB);
        const resultB = vectorWithAppliedVectors(otherB, thisA, thisB);
        const resultC = vectorWithAppliedVectors(this.toTranslateVector(), otherA, otherB);
        const resultVector = other.toTranslateVector().withAddedVector(resultC);
        const newMatrix = [...this.matrix3d];
        newMatrix[0] = resultA.x;
        newMatrix[1] = resultA.y;
        newMatrix[4] = resultB.x;
        newMatrix[5] = resultB.y;
        newMatrix[12] = resultVector.x;
        newMatrix[13] = resultVector.y;
        return new Transform(newMatrix);
    }
    withTranslation(point) {
        const newMatrix = [...this.matrix3d];
        newMatrix[12] = point.x;
        newMatrix[13] = point.y;
        return new Transform(newMatrix);
    }
}
exports.Transform = Transform;
Transform.identity = new Transform([
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
    0,
    0,
    0,
    0,
    1,
]);
//# sourceMappingURL=index.js.map