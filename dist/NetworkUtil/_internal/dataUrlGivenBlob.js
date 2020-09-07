"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.dataUrlGivenBlob = void 0;
async function dataUrlGivenBlob(blob) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onloadend = () => {
            resolve(fileReader.result);
        };
        fileReader.onerror = () => {
            reject(fileReader.error);
        };
        fileReader.readAsDataURL(blob);
    });
}
exports.dataUrlGivenBlob = dataUrlGivenBlob;
//# sourceMappingURL=dataUrlGivenBlob.js.map