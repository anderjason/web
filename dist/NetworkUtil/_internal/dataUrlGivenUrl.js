"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUrlGivenUrl = void 0;
const blobGivenUrl_1 = require("./blobGivenUrl");
const dataUrlGivenBlob_1 = require("./dataUrlGivenBlob");
async function dataUrlGivenUrl(url) {
    const blob = await blobGivenUrl_1.blobGivenUrl(url);
    const dataUrl = await dataUrlGivenBlob_1.dataUrlGivenBlob(blob);
    return dataUrl;
}
exports.dataUrlGivenUrl = dataUrlGivenUrl;
//# sourceMappingURL=dataUrlGivenUrl.js.map