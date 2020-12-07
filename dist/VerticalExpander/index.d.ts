import { Actor } from "skytree";
import { Observable } from "@anderjason/observable";
export interface VerticalExpanderProps {
    parentElement: HTMLElement;
    isExpanded: Observable<boolean>;
    maxHeight?: number | Observable<number>;
}
export declare class VerticalExpander extends Actor<VerticalExpanderProps> {
    private _content;
    private _maxHeight;
    constructor(props: VerticalExpanderProps);
    get element(): HTMLDivElement;
    onActivate(): void;
}
