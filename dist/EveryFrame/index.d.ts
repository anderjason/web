import { ManagedObject } from "skytree";
export interface EveryFrameProps {
    callback: (frameNumber: number) => void;
}
export declare class EveryFrame extends ManagedObject<EveryFrameProps> {
    onActivate(): void;
}
