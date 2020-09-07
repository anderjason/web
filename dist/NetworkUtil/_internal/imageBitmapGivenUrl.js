"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.imageBitmapGivenUrl = void 0;
function imageBitmapGivenUrl(url) {
    return new Promise((resolve, reject) => {
        const img = document.createElement("img");
        img.onload = () => {
            resolve(img);
        };
        img.onerror = () => {
            reject(new Error("Could not load image"));
        };
        img.crossOrigin = "anonymous";
        img.src = url;
    });
}
exports.imageBitmapGivenUrl = imageBitmapGivenUrl;
//# sourceMappingURL=imageBitmapGivenUrl.js.map