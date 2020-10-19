import { Color } from "@anderjason/color";
import { Size2 } from "@anderjason/geometry";
import { Observable, ObservableBase, ReadOnlyObservable } from "@anderjason/observable";
import { ElementStyle } from "../ElementStyle";
import { Actor } from "skytree";
export declare type ScrollDirection = "none" | "vertical" | "horizontal" | "both";
export interface ScrollAreaProps {
    parentElement: HTMLElement | Observable<HTMLElement>;
    direction: ScrollDirection | ObservableBase<ScrollDirection>;
    scrollPositionColor: Color | ObservableBase<Color>;
    backgroundColor?: Color;
}
export declare function styleGivenHexColor(color: Color): ElementStyle;
export declare class ScrollArea extends Actor<ScrollAreaProps> {
    private _scrollbarSize;
    readonly scrollbarSize: ReadOnlyObservable<Size2>;
    private _wrapper;
    constructor(props: ScrollAreaProps);
    get element(): HTMLElement;
    onActivate(): void;
}
