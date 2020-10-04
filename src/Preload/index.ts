import {
  Observable,
  ReadOnlyObservable,
  TypedEvent,
} from "@anderjason/observable";
import * as FontFaceObserver from "fontfaceobserver";
import { Actor, SequentialWorker } from "skytree";
import { blobGivenUrl } from "../NetworkUtil/_internal/blobGivenUrl";
import { dataUrlGivenBlob } from "../NetworkUtil/_internal/dataUrlGivenBlob";

export interface FontStyle {
  url: string;
  fontFamily: string;
  weight?: number;
  style?: "normal" | "italic";
}

export class Preload extends Actor<void> {
  private static _instance: Preload;

  static get instance(): Preload {
    if (this._instance == null) {
      this._instance = new Preload();
      this._instance.activate();
    }

    return this._instance;
  }

  readonly didLoadImage = new TypedEvent<string>();
  readonly didLoadFont = new TypedEvent<FontStyle>();

  private _isReady = Observable.givenValue(true, Observable.isStrictEqual);
  readonly isReady = ReadOnlyObservable.givenObservable(this._isReady);

  private _imageDataUrlByUrl = new Map<string, Observable<string>>();
  private _sequenceWorker: SequentialWorker;

  private _loadedFontSet = new Set<FontStyle>();
  private _loadingImageSet = new Set<string>();
  private _loadingFontSet = new Set<FontStyle>();
  private _requestedFontSet = new Set<FontStyle>();

  addImage(url: string, priority: number = 5): void {
    if (this._imageDataUrlByUrl.has(url)) {
      return;
    }

    this._imageDataUrlByUrl.set(
      url,
      Observable.ofEmpty<string>(Observable.isStrictEqual)
    );

    this._loadingImageSet.add(url);
    this._isReady.setValue(false);

    this._sequenceWorker.addWork(
      async () => {
        await this.loadImage(url);
      },
      undefined,
      priority
    );
  }

  addFont(fontStyle: FontStyle, priority: number = 5): void {
    if (this._requestedFontSet.has(fontStyle)) {
      return;
    }

    this._isReady.setValue(false);
    this._requestedFontSet.add(fontStyle);
    this.loadGoogleFont(fontStyle);
  }

  toPreloadedImageUrl(imageUrl: string): Observable<string> {
    if (!this._imageDataUrlByUrl.has(imageUrl)) {
      throw new Error("Add the image with addImage() first");
    }

    return this._imageDataUrlByUrl.get(imageUrl);
  }

  ensureImageLoaded(imageUrl: string): Promise<void> {
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

  ensureFontLoaded(fontStyle: FontStyle): Promise<void> {
    if (this._loadedFontSet.has(fontStyle)) {
      return Promise.resolve();
    }

    if (!this._loadingFontSet.has(fontStyle)) {
      return Promise.reject(
        new Error(
          `This font style has not been defined. Call defineCustom() first.`
        )
      );
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

  ensureAllLoaded(): Promise<void> {
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

  private async loadImage(url: string): Promise<void> {
    const blob = await blobGivenUrl(url);
    const dataUrl = await dataUrlGivenBlob(blob);

    this._imageDataUrlByUrl.get(url).setValue(dataUrl);
    this.didLoadImage.emit(url);
    this.checkReady();
  }

  private loadGoogleFont(fontStyle: FontStyle): void {
    if (fontStyle == null) {
      return;
    }

    if (
      this._loadingFontSet.has(fontStyle) ||
      this._loadedFontSet.has(fontStyle)
    ) {
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

  private checkReady(): void {
    this._isReady.setValue(
      this._loadingFontSet.size === 0 && this._loadingImageSet.size === 0
    );
  }
}
