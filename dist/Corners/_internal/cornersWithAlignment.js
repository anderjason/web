"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.cornersWithAlignment = void 0;
const util_1 = require("@anderjason/util");
const __1 = require("..");
const totalDistanceGivenPointArrays_1 = require("./totalDistanceGivenPointArrays");
function cornersWithAlignment(input, alignment) {
    const candidateArrayA = input.toPoints();
    const candidateArrayB = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayA);
    const candidateArrayC = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayB);
    const candidateArrayD = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayC);
    const candidateArrayE = util_1.ArrayUtil.arrayWithReversedOrder(candidateArrayA);
    const candidateArrayF = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayE);
    const candidateArrayG = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayF);
    const candidateArrayH = util_1.ArrayUtil.arrayWithLeftShift(candidateArrayG);
    const targetArray = alignment.toPoints();
    const candidateArrays = [
        candidateArrayA,
        candidateArrayB,
        candidateArrayC,
        candidateArrayD,
        candidateArrayE,
        candidateArrayF,
        candidateArrayG,
        candidateArrayH,
    ];
    const arraysWithDistance = candidateArrays.map((candidateArray) => {
        return {
            candidateArray,
            totalDistance: (0, totalDistanceGivenPointArrays_1.totalDistanceGivenPointArrays)(candidateArray, targetArray),
        };
    });
    const sorted = util_1.ArrayUtil.arrayWithOrderFromValue(arraysWithDistance, (arrayWithDistance) => {
        return arrayWithDistance.totalDistance;
    }, "ascending");
    const bestCandidateArray = sorted[0].candidateArray;
    return __1.Corners.givenPoints(bestCandidateArray);
}
exports.cornersWithAlignment = cornersWithAlignment;
//# sourceMappingURL=cornersWithAlignment.js.map