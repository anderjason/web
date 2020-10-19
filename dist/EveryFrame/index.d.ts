import { Actor } from "skytree";
export interface EveryFrameProps {
    callback: (frameNumber: number) => void;
}
export declare class EveryFrame extends Actor<EveryFrameProps> {
    frameNumber: number;
    onActivate(): void;
}
