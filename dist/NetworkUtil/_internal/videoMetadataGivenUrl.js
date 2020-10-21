"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.videoMetadataGivenUrl = void 0;
const geometry_1 = require("@anderjason/geometry");
function videoMetadataGivenUrl(url) {
    return new Promise((resolve, reject) => {
        const video = document.createElement("video");
        video.addEventListener("loadedmetadata", () => {
            resolve({
                url,
                contentSize: geometry_1.Size2.givenWidthHeight(video.videoWidth, video.videoHeight),
            });
        }, false);
        video.addEventListener("error", () => {
            reject(new Error("Could not load image"));
        });
        video.src = url;
    });
}
exports.videoMetadataGivenUrl = videoMetadataGivenUrl;
//# sourceMappingURL=videoMetadataGivenUrl.js.map