"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.blobGivenUrl = void 0;
async function blobGivenUrl(url) {
    const response = await fetch(url);
    const blob = await response.blob();
    return blob;
}
exports.blobGivenUrl = blobGivenUrl;
//# sourceMappingURL=blobGivenUrl.js.map