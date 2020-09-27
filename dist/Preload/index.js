"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Preload = void 0;
const observable_1 = require("@anderjason/observable");
const FontFaceObserver = require("fontfaceobserver");
class Preload {
    constructor() {
        this.didLoadImage = new observable_1.TypedEvent();
        this.didLoadFont = new observable_1.TypedEvent();
        this._isReady = observable_1.Observable.givenValue(true, observable_1.Observable.isStrictEqual);
        this.isReady = observable_1.ReadOnlyObservable.givenObservable(this._isReady);
        this._loadedImageSet = new Set();
        this._loadedFontSet = new Set();
        this._loadingImageSet = new Set();
        this._loadingFontSet = new Set();
        this._requestedImageSet = new Set();
        this._requestedFontSet = new Set();
    }
    get loadedImageSet() {
        return this._loadedImageSet;
    }
    get loadedFontSet() {
        return this._loadedFontSet;
    }
    get loadingImageSet() {
        return this._loadingImageSet;
    }
    get loadingFontSet() {
        return this._loadingFontSet;
    }
    addImage(url) {
        if (this._requestedImageSet.has(url)) {
            return;
        }
        this._isReady.setValue(false);
        this._requestedImageSet.add(url);
        this.loadImage(url);
    }
    addFont(fontStyle) {
        if (this._requestedFontSet.has(fontStyle)) {
            return;
        }
        this._isReady.setValue(false);
        this._requestedFontSet.add(fontStyle);
        this.loadGoogleFont(fontStyle);
    }
    ensureFontLoaded(fontStyle) {
        if (this._loadedFontSet.has(fontStyle)) {
            return Promise.resolve();
        }
        if (!this._loadingFontSet.has(fontStyle)) {
            return Promise.reject(new Error(`This font style has not been defined. Call defineCustom() first.`));
        }
        return new Promise((resolve) => {
            const handle = this.didLoadFont.subscribe((loadedTextStyle) => {
                if (loadedTextStyle === fontStyle) {
                    handle.cancel();
                    resolve();
                }
            });
        });
    }
    ensureAllLoaded() {
        if (this._isReady.value === true) {
            return Promise.resolve();
        }
        return new Promise((resolve) => {
            const handle = this.isReady.didChange.subscribe((isReady) => {
                if (isReady === true) {
                    handle.cancel();
                    resolve();
                }
            });
        });
    }
    loadImage(url) {
        if (this._loadingImageSet.has(url) || this._loadedImageSet.has(url)) {
            return;
        }
        this._loadingImageSet.add(url);
        const img = document.createElement("img");
        img.onload = () => {
            this._loadingImageSet.delete(url);
            this._loadedImageSet.add(url);
            this.didLoadImage.emit(url);
            this.checkReady();
        };
        img.src = url;
    }
    loadGoogleFont(fontStyle) {
        if (fontStyle == null) {
            return;
        }
        if (this._loadingFontSet.has(fontStyle) ||
            this._loadedFontSet.has(fontStyle)) {
            return;
        }
        this._loadingFontSet.add(fontStyle);
        const link = document.createElement("link");
        link.href = fontStyle.url;
        link.rel = "stylesheet";
        link.type = "text/css";
        document.head.appendChild(link);
        const font = new FontFaceObserver(fontStyle.fontFamily, {
            weight: fontStyle.weight,
            style: fontStyle.style,
        });
        font.load().then(() => {
            this._loadingFontSet.delete(fontStyle);
            this._loadedFontSet.add(fontStyle);
            this.didLoadFont.emit(fontStyle);
            this.checkReady();
        });
    }
    checkReady() {
        this._isReady.setValue(this._loadingFontSet.size === 0 && this._loadingImageSet.size === 0);
    }
}
exports.Preload = Preload;
Preload.instance = new Preload();
//# sourceMappingURL=index.js.map