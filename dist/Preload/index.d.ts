import { ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
export interface FontStyle {
    url: string;
    fontFamily: string;
    weight?: number;
    style?: "normal" | "italic";
}
export declare class Preload {
    static readonly instance: Preload;
    readonly didLoadImage: TypedEvent<string>;
    readonly didLoadFont: TypedEvent<FontStyle>;
    private _isReady;
    readonly isReady: ReadOnlyObservable<boolean>;
    private _loadedImageSet;
    private _loadedFontSet;
    private _loadingImageSet;
    private _loadingFontSet;
    private _requestedImageSet;
    private _requestedFontSet;
    get loadedImageSet(): Set<string>;
    get loadedFontSet(): Set<FontStyle>;
    get loadingImageSet(): Set<string>;
    get loadingFontSet(): Set<FontStyle>;
    addImage(url: string): void;
    addFont(fontStyle: FontStyle): void;
    ensureFontLoaded(fontStyle: FontStyle): Promise<void>;
    ensureAllLoaded(): Promise<void>;
    private loadImage;
    private loadGoogleFont;
    private checkReady;
}
