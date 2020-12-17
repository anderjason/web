import { Color } from "@anderjason/color";
import { Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase, ReadOnlyObservable, TypedEvent } from "@anderjason/observable";
import { Actor } from "skytree";
export declare type ScrollDirection = "none" | "vertical" | "horizontal" | "both";
export interface ScrollAreaProps {
    parentElement: HTMLElement | Observable<HTMLElement>;
    direction: ScrollDirection | ObservableBase<ScrollDirection>;
    scrollPositionColor: Color | ObservableBase<Color>;
    anchorBottom?: boolean;
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
    private _direction;
    private _contentSizeWatcher;
    get contentSize(): ReadOnlyObservable<Size2>;
    constructor(props: ScrollAreaProps);
    get element(): HTMLElement;
    get scrollElement(): HTMLElement;
    onActivate(): void;
}
