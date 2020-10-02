import { Observable } from "@anderjason/observable";
import { ManagedObject, SequentialWorker } from "skytree";
import { blobGivenUrl } from "../NetworkUtil/_internal/blobGivenUrl";
import { dataUrlGivenBlob } from "../NetworkUtil/_internal/dataUrlGivenBlob";

export class ImageCache extends ManagedObject<void> {
  private _data = new Map<string, Observable<string>>();
  private _sequenceWorker: SequentialWorker;

  onActivate() {
    this._sequenceWorker = this.addManagedObject(new SequentialWorker({}));
  }

  ensureUrlReady(url: string): Promise<void> {
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

  toObservableGivenUrl(url: string): Observable<string> {
    if (!this._data.has(url)) {
      this._data.set(url, Observable.ofEmpty<string>(Observable.isStrictEqual));

      this._sequenceWorker.addWork(async () => {
        await this.load(url);
      });
    }

    return this._data.get(url);
  }

  private async load(url: string): Promise<void> {
    const blob = await blobGivenUrl(url);
    const dataUrl = await dataUrlGivenBlob(blob);

    this._data.get(url).setValue(dataUrl);
  }
}
