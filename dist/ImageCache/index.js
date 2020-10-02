"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ImageCache = void 0;
const observable_1 = require("@anderjason/observable");
const skytree_1 = require("skytree");
const blobGivenUrl_1 = require("../NetworkUtil/_internal/blobGivenUrl");
const dataUrlGivenBlob_1 = require("../NetworkUtil/_internal/dataUrlGivenBlob");
class ImageCache extends skytree_1.ManagedObject {
    constructor() {
        super(...arguments);
        this._data = new Map();
    }
    onActivate() {
        this._sequenceWorker = this.addManagedObject(new skytree_1.SequentialWorker({}));
    }
    ensureUrlReady(url) {
        return new Promise((resolve) => {
            const observable = this.toObservableGivenUrl(url);
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
    toObservableGivenUrl(url) {
        if (!this._data.has(url)) {
            this._data.set(url, observable_1.Observable.ofEmpty(observable_1.Observable.isStrictEqual));
            this._sequenceWorker.addWork(async () => {
                await this.load(url);
            });
        }
        return this._data.get(url);
    }
    async load(url) {
        const blob = await blobGivenUrl_1.blobGivenUrl(url);
        const dataUrl = await dataUrlGivenBlob_1.dataUrlGivenBlob(blob);
        this._data.get(url).setValue(dataUrl);
    }
}
exports.ImageCache = ImageCache;
//# sourceMappingURL=index.js.map