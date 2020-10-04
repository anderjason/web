import { Observable, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { Actor } from "skytree";
export interface FontStyle {
    url: string;
    fontFamily: string;
    weight?: number;
    style?: "normal" | "italic";
}
export declare class Preload extends Actor<void> {
    private static _instance;
    static instance(): Preload;
    readonly didLoadImage: TypedEvent<string>;
    readonly didLoadFont: TypedEvent<FontStyle>;
    private _isReady;
    readonly isReady: ReadOnlyObservable<boolean>;
    private _imageDataUrlByUrl;
    private _sequenceWorker;
    private _loadedFontSet;
    private _loadingImageSet;
    private _loadingFontSet;
    private _requestedFontSet;
    addImage(url: string, priority?: number): void;
    addFont(fontStyle: FontStyle, priority?: number): void;
    toPreloadedImageUrl(imageUrl: string): Observable<string>;
    ensureImageLoaded(imageUrl: string): Promise<void>;
    ensureFontLoaded(fontStyle: FontStyle): Promise<void>;
    ensureAllLoaded(): Promise<void>;
    private loadImage;
    private loadGoogleFont;
    private checkReady;
}
