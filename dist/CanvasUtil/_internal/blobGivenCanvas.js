"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blobGivenCanvas = void 0;
async function blobGivenCanvas(canvas, type) {
    return new Promise((resolve, reject) => {
        canvas.toBlob((blob) => {
            if (blob == null) {
                reject(new Error("Unknown error rendering canvas to blob"));
                return;
            }
            resolve(blob);
        }, type);
    });
}
exports.blobGivenCanvas = blobGivenCanvas;
//# sourceMappingURL=blobGivenCanvas.js.map