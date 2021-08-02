import { Color } from "@anderjason/color";
import { Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { Actor } from "skytree";
export declare type ScrollDirection = "none" | "vertical" | "horizontal" | "both";
export declare type ContentArea = "full" | "inset";
export interface ScrollAreaTrackSize {
    leadingPadding?: number;
    trailingPadding?: number;
    innerPadding?: number;
    outerPadding?: number;
    thumbRadius?: number;
}
export interface ScrollAreaProps {
    parentElement: HTMLElement | Observable<HTMLElement>;
    direction: ScrollDirection | ObservableBase<ScrollDirection>;
    scrollPositionColor: Color | ObservableBase<Color>;
    anchorBottom?: boolean | ObservableBase<boolean>;
    contentArea?: ContentArea | ObservableBase<ContentArea>;
    horizontalTrackSize?: ScrollAreaTrackSize;
    verticalTrackSize?: ScrollAreaTrackSize;
    thumbWidth?: number;
}
export declare class ScrollArea extends Actor<ScrollAreaProps> {
    static readonly willScroll: TypedEvent<ScrollArea>;
    private _scrollbarSize;
    readonly scrollbarSize: ReadOnlyObservable<Size2>;
    private _overflowDirection;
    readonly overflowDirection: ReadOnlyObservable<ScrollDirection>;
    private _scroller;
    private _content;
    private _scrollPositionColor;
    private _contentArea;
    private _anchorBottom;
    private _direction;
    private _contentSizeWatcher;
    private _verticalTrackSize;
    private _horizontalTrackSize;
    private _thumbWidth;
    get contentSize(): ReadOnlyObservable<Size2>;
    constructor(props: ScrollAreaProps);
    get element(): HTMLElement;
    get scrollElement(): HTMLElement;
    onActivate(): void;
}
