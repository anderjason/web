"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.NetworkUtil = void 0;
const dataUrlGivenUrl_1 = require("./_internal/dataUrlGivenUrl");
const blobGivenUrl_1 = require("./_internal/blobGivenUrl");
const imageBitmapGivenUrl_1 = require("./_internal/imageBitmapGivenUrl");
const scriptGivenUrl_1 = require("./_internal/scriptGivenUrl");
const dataUrlGivenBlob_1 = require("./_internal/dataUrlGivenBlob");
class NetworkUtil {
}
exports.NetworkUtil = NetworkUtil;
NetworkUtil.blobGivenUrl = blobGivenUrl_1.blobGivenUrl;
NetworkUtil.dataUrlGivenUrl = dataUrlGivenUrl_1.dataUrlGivenUrl;
NetworkUtil.dataUrlGivenBlob = dataUrlGivenBlob_1.dataUrlGivenBlob;
NetworkUtil.imageBitmapGivenUrl = imageBitmapGivenUrl_1.imageBitmapGivenUrl;
NetworkUtil.scriptGivenUrl = scriptGivenUrl_1.scriptGivenUrl;
//# sourceMappingURL=index.js.map