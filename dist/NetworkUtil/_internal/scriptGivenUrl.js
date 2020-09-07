"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.scriptGivenUrl = void 0;
function scriptGivenUrl(url) {
    return new Promise((resolve, reject) => {
        const script = document.createElement("script");
        script.type = "text/javascript";
        script.onload = () => {
            resolve();
        };
        script.onerror = () => {
            reject();
        };
        script.src = url;
        document.head.appendChild(script);
    });
}
exports.scriptGivenUrl = scriptGivenUrl;
//# sourceMappingURL=scriptGivenUrl.js.map