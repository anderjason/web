"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.totalDistanceGivenPointArrays = void 0;
function totalDistanceGivenPointArrays(a, b) {
    if (a == null || b == null) {
        throw new Error("Two arrays are required");
    }
    if (a.length !== b.length) {
        throw new Error("Both arrays must be the same length");
    }
    let difference = 0;
    a.forEach((point, idx) => {
        difference += point.toDistance(b[idx]);
    });
    return difference;
}
exports.totalDistanceGivenPointArrays = totalDistanceGivenPointArrays;
//# sourceMappingURL=totalDistanceGivenPointArrays.js.map