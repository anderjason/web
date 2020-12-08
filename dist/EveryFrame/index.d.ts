import { Actor } from "skytree";
export interface EveryFrameProps {
    fn: (frameNumber: number) => void;
}
export declare class EveryFrame extends Actor<EveryFrameProps> {
    frameNumber: number;
    onActivate(): void;
}
