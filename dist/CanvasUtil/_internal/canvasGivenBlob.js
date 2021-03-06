"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.canvasGivenBlob = void 0;
async function canvasGivenBlob(blob, maxSize) {
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onerror = () => {
            reject(fileReader.error);
        };
        fileReader.onloadend = (e) => {
            const img = new Image();
            img.addEventListener("error", (e) => {
                reject(e.error);
            });
            img.addEventListener("load", () => {
                const canvas = document.createElement("canvas");
                let width = img.width;
                let height = img.height;
                if (maxSize != null) {
                    const scaleX = maxSize.width / img.width;
                    const scaleY = maxSize.height / img.height;
                    const scale = Math.min(scaleX, scaleY, 1);
                    width = Math.round(img.width * scale);
                    height = Math.round(img.height * scale);
                }
                canvas.width = width;
                canvas.height = height;
                const ctx = canvas.getContext("2d");
                ctx.imageSmoothingEnabled = true;
                ctx.imageSmoothingQuality = "high";
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
                resolve(canvas);
            });
            img.src = e.target.result;
        };
        fileReader.readAsDataURL(blob);
    });
}
exports.canvasGivenBlob = canvasGivenBlob;
//# sourceMappingURL=canvasGivenBlob.js.map