"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.matrixTransformGivenCorners = void 0;
const Matrix_1 = require("./Matrix");
const Vector_1 = require("./Vector");
function matrixTransformGivenCorners(corners, size) {
    const { width, height } = size;
    const fromPts = [
        {
            x: 0,
            y: 0,
        },
        {
            x: 0,
            y: height,
        },
        {
            x: width,
            y: 0,
        },
        {
            x: width,
            y: height,
        },
    ];
    const toPts = [
        {
            x: corners.leftTop.x,
            y: corners.leftTop.y,
        },
        {
            x: corners.leftBottom.x,
            y: corners.leftBottom.y,
        },
        {
            x: corners.rightTop.x,
            y: corners.rightTop.y,
        },
        {
            x: corners.rightBottom.x,
            y: corners.rightBottom.y,
        },
    ];
    const E = Matrix_1.Matrix.givenRows([
        [
            fromPts[0].x,
            fromPts[0].y,
            1,
            0,
            0,
            0,
            -fromPts[0].x * toPts[0].x,
            -fromPts[0].y * toPts[0].x,
        ],
        [
            0,
            0,
            0,
            fromPts[0].x,
            fromPts[0].y,
            1,
            -fromPts[0].x * toPts[0].y,
            -fromPts[0].y * toPts[0].y,
        ],
        [
            fromPts[1].x,
            fromPts[1].y,
            1,
            0,
            0,
            0,
            -fromPts[1].x * toPts[1].x,
            -fromPts[1].y * toPts[1].x,
        ],
        [
            0,
            0,
            0,
            fromPts[1].x,
            fromPts[1].y,
            1,
            -fromPts[1].x * toPts[1].y,
            -fromPts[1].y * toPts[1].y,
        ],
        [
            fromPts[2].x,
            fromPts[2].y,
            1,
            0,
            0,
            0,
            -fromPts[2].x * toPts[2].x,
            -fromPts[2].y * toPts[2].x,
        ],
        [
            0,
            0,
            0,
            fromPts[2].x,
            fromPts[2].y,
            1,
            -fromPts[2].x * toPts[2].y,
            -fromPts[2].y * toPts[2].y,
        ],
        [
            fromPts[3].x,
            fromPts[3].y,
            1,
            0,
            0,
            0,
            -fromPts[3].x * toPts[3].x,
            -fromPts[3].y * toPts[3].x,
        ],
        [
            0,
            0,
            0,
            fromPts[3].x,
            fromPts[3].y,
            1,
            -fromPts[3].x * toPts[3].y,
            -fromPts[3].y * toPts[3].y,
        ],
    ]);
    const inverseE = E.withInverse();
    if (inverseE == null) {
        return undefined;
    }
    const vector = new Vector_1.Vector([
        toPts[0].x,
        toPts[0].y,
        toPts[1].x,
        toPts[1].y,
        toPts[2].x,
        toPts[2].y,
        toPts[3].x,
        toPts[3].y,
    ]);
    const r = vector.withMultipliedMatrix(inverseE);
    const transformMatrix = Matrix_1.Matrix.givenRows([
        [r.elements[0], r.elements[1], 0, r.elements[2]],
        [r.elements[3], r.elements[4], 0, r.elements[5]],
        [0, 0, 1, 0],
        [r.elements[6], r.elements[7], 0, 1],
    ]);
    const result = [];
    for (var i = 0; i <= 3; i++) {
        for (var j = 0; j <= 3; j++) {
            result.push(transformMatrix.toOptionalValueGivenRowAndColumn(j, i));
        }
    }
    return result;
}
exports.matrixTransformGivenCorners = matrixTransformGivenCorners;
//# sourceMappingURL=matrixTransformGivenCorners.js.map