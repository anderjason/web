"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.Preload = void 0;
const observable_1 = require("@anderjason/observable");
const FontFaceObserver = require("fontfaceobserver");
const skytree_1 = require("skytree");
const blobGivenUrl_1 = require("../NetworkUtil/_internal/blobGivenUrl");
const dataUrlGivenBlob_1 = require("../NetworkUtil/_internal/dataUrlGivenBlob");
class Preload extends skytree_1.Actor {
    constructor() {
        super(...arguments);
        this.didLoadImage = new observable_1.TypedEvent();
        this.didLoadFont = new observable_1.TypedEvent();
        this._isReady = observable_1.Observable.givenValue(true, observable_1.Observable.isStrictEqual);
        this.isReady = observable_1.ReadOnlyObservable.givenObservable(this._isReady);
        this._imageDataUrlByUrl = new Map();
        this._loadedFontSet = new Set();
        this._loadingImageSet = new Set();
        this._loadingFontSet = new Set();
        this._requestedFontSet = new Set();
    }
    static instance() {
        if (this._instance == null) {
            this._instance = new Preload();
            this._instance.activate();
        }
        return this._instance;
    }
    addImage(url, priority = 5) {
        if (this._imageDataUrlByUrl.has(url)) {
            return;
        }
        this._imageDataUrlByUrl.set(url, observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual));
        this._loadingImageSet.add(url);
        this._isReady.setValue(false);
        this._sequenceWorker.addWork(async () => {
            await this.loadImage(url);
        }, undefined, priority);
    }
    addFont(fontStyle, priority = 5) {
        if (this._requestedFontSet.has(fontStyle)) {
            return;
        }
        this._isReady.setValue(false);
        this._requestedFontSet.add(fontStyle);
        this.loadGoogleFont(fontStyle);
    }
    toPreloadedImageUrl(imageUrl) {
        if (!this._imageDataUrlByUrl.has(imageUrl)) {
            throw new Error("Add the image with addImage() first");
        }
        return this._imageDataUrlByUrl.get(imageUrl);
    }
    ensureImageLoaded(imageUrl) {
        if (!this._imageDataUrlByUrl.has(imageUrl)) {
            throw new Error("Add the image with addImage() first");
        }
        return new Promise((resolve) => {
            const observable = this.toPreloadedImageUrl(imageUrl);
            const receipt = observable.didChange.subscribe((value) => {
                if (value == null) {
                    return;
                }
                setTimeout(() => {
                    receipt.cancel();
                    resolve();
                }, 1);
            }, true);
        });
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
    async loadImage(url) {
        const blob = await blobGivenUrl_1.blobGivenUrl(url);
        const dataUrl = await dataUrlGivenBlob_1.dataUrlGivenBlob(blob);
        this._imageDataUrlByUrl.get(url).setValue(dataUrl);
        this.didLoadImage.emit(url);
        this.checkReady();
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
//# sourceMappingURL=index.js.map