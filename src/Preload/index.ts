import { Size2 } from "@anderjason/geometry";
import {
  Observable,
  ReadOnlyObservable,
  TypedEvent,
} from "@anderjason/observable";
import * as FontFaceObserver from "fontfaceobserver";
import { Actor, SequentialWorker } from "skytree";
import { blobGivenUrl } from "../NetworkUtil/_internal/blobGivenUrl";
import { dataUrlGivenBlob } from "../NetworkUtil/_internal/dataUrlGivenBlob";
import { videoMetadataGivenUrl } from "../NetworkUtil/_internal/videoMetadataGivenUrl";

export interface FontStyle {
  url: string;
  fontFamily: string;
  weight?: number;
  style?: "normal" | "italic";
}

export interface VideoMetadata {
  url: string;
  contentSize: Size2;
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

  readonly didLoadVideo = new TypedEvent<string>();
  readonly didLoadImage = new TypedEvent<string>();
  readonly didLoadFont = new TypedEvent<FontStyle>();

  private _isReady = Observable.givenValue(true, Observable.isStrictEqual);
  readonly isReady = ReadOnlyObservable.givenObservable(this._isReady);

  private _sequentialWorker: SequentialWorker;

  private _videoMetadataByUrl = new Map<string, Observable<VideoMetadata>>();
  private _imageDataUrlByUrl = new Map<string, Observable<string>>();
  private _loadedFontSet = new Set<FontStyle>();

  private _loadingVideoSet = new Set<string>();
  private _loadingFontSet = new Set<FontStyle>();
  private _loadingImageSet = new Set<string>();

  private _requestedFontSet = new Set<FontStyle>();

  onActivate() {
    this._sequentialWorker = this.addActor(new SequentialWorker({}));
  }

  addImage(
    url: string,
    priority: number = 5,
    includeCredentials?: boolean
  ): void {
    if (this._imageDataUrlByUrl.has(url)) {
      return;
    }

    this._imageDataUrlByUrl.set(
      url,
      Observable.ofEmpty<string>(Observable.isStrictEqual)
    );

    this._loadingImageSet.add(url);
    this._isReady.setValue(false);

    this._sequentialWorker.addWork(
      async () => {
        await this.loadImage(url, includeCredentials);
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

  addVideo(url: string, priority: number = 5): void {
    if (this._videoMetadataByUrl.has(url)) {
      return;
    }

    this._videoMetadataByUrl.set(
      url,
      Observable.ofEmpty<VideoMetadata>(Observable.isStrictEqual)
    );

    this._loadingVideoSet.add(url);
    this._isReady.setValue(false);

    this._sequentialWorker.addWork(
      async () => {
        await this.loadVideo(url);
      },
      undefined,
      priority
    );
  }

  toPreloadedImageUrl(imageUrl: string): Observable<string> {
    if (!this._imageDataUrlByUrl.has(imageUrl)) {
      this.addImage(imageUrl);
    }

    return this._imageDataUrlByUrl.get(imageUrl);
  }

  toVideoMetadataGivenUrl(url: string): Observable<VideoMetadata> {
    if (!this._videoMetadataByUrl.has(url)) {
      this.addVideo(url);
    }

    return this._videoMetadataByUrl.get(url);
  }

  ensureImageLoaded(imageUrl: string): Promise<void> {
    if (!this._imageDataUrlByUrl.has(imageUrl)) {
      this.addImage(imageUrl);
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

  ensureVideoLoaded(url: string): Promise<void> {
    if (!this._videoMetadataByUrl.has(url)) {
      this.addVideo(url);
    }

    return new Promise((resolve) => {
      const observable = this.toVideoMetadataGivenUrl(url);
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

  private async loadImage(
    url: string,
    includeCredentials: boolean
  ): Promise<void> {
    let init: RequestInit;
    if (includeCredentials) {
      init = {
        credentials: "include",
      };
    }

    const blob = await blobGivenUrl(url, init);
    const dataUrl = await dataUrlGivenBlob(blob);

    this._imageDataUrlByUrl.get(url).setValue(dataUrl);

    this._loadingImageSet.delete(url);
    this.didLoadImage.emit(url);
    this.checkReady();
  }

  private async loadVideo(url: string): Promise<void> {
    const metadata = await videoMetadataGivenUrl(url);

    this._videoMetadataByUrl.get(url).setValue(metadata);

    this._loadingVideoSet.delete(url);
    this.didLoadVideo.emit(url);
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
      this._loadingFontSet.size === 0 &&
        this._loadingImageSet.size === 0 &&
        this._loadingVideoSet.size === 0
    );
  }
}
