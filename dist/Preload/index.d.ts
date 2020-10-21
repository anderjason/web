import { Size2 } from "@anderjason/geometry";
import { Observable, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { Actor } from "skytree";
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
export declare class Preload extends Actor<void> {
    private static _instance;
    static get instance(): Preload;
    readonly didLoadVideo: TypedEvent<string>;
    readonly didLoadImage: TypedEvent<string>;
    readonly didLoadFont: TypedEvent<FontStyle>;
    private _isReady;
    readonly isReady: ReadOnlyObservable<boolean>;
    private _sequentialWorker;
    private _videoMetadataByUrl;
    private _imageDataUrlByUrl;
    private _loadedFontSet;
    private _loadingVideoSet;
    private _loadingFontSet;
    private _loadingImageSet;
    private _requestedFontSet;
    onActivate(): void;
    addImage(url: string, priority?: number): void;
    addFont(fontStyle: FontStyle, priority?: number): void;
    addVideo(url: string, priority?: number): void;
    toPreloadedImageUrl(imageUrl: string): Observable<string>;
    toVideoMetadataGivenUrl(url: string): Observable<VideoMetadata>;
    ensureImageLoaded(imageUrl: string): Promise<void>;
    ensureFontLoaded(fontStyle: FontStyle): Promise<void>;
    ensureVideoLoaded(url: string): Promise<void>;
    ensureAllLoaded(): Promise<void>;
    private loadImage;
    private loadVideo;
    private loadGoogleFont;
    private checkReady;
}
