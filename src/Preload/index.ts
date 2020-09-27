import {
  Observable,
  ReadOnlyObservable,
  TypedEvent,
} from "@anderjason/observable";
import * as FontFaceObserver from "fontfaceobserver";

export interface FontStyle {
  url: string;
  fontFamily: string;
  weight?: number;
  style?: "normal" | "italic";
}

export class Preload {
  static readonly instance = new Preload();

  readonly didLoadImage = new TypedEvent<string>();
  readonly didLoadFont = new TypedEvent<FontStyle>();

  private _isReady = Observable.givenValue(true, Observable.isStrictEqual);
  readonly isReady = ReadOnlyObservable.givenObservable(this._isReady);

  private _loadedImageSet = new Set<string>();
  private _loadedFontSet = new Set<FontStyle>();

  private _loadingImageSet = new Set<string>();
  private _loadingFontSet = new Set<FontStyle>();

  private _requestedImageSet = new Set<string>();
  private _requestedFontSet = new Set<FontStyle>();

  get loadedImageSet(): Set<string> {
    return this._loadedImageSet;
  }

  get loadedFontSet(): Set<FontStyle> {
    return this._loadedFontSet;
  }

  get loadingImageSet(): Set<string> {
    return this._loadingImageSet;
  }

  get loadingFontSet(): Set<FontStyle> {
    return this._loadingFontSet;
  }

  addImage(url: string): void {
    if (this._requestedImageSet.has(url)) {
      return;
    }

    this._isReady.setValue(false);
    this._requestedImageSet.add(url);
    this.loadImage(url);
  }

  addFont(fontStyle: FontStyle): void {
    if (this._requestedFontSet.has(fontStyle)) {
      return;
    }

    this._isReady.setValue(false);
    this._requestedFontSet.add(fontStyle);
    this.loadGoogleFont(fontStyle);
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

  private loadImage(url: string): void {
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
