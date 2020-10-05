import { Actor } from "skytree";
import { Pointer } from ".";
export interface TouchVisualizerProps {
    touchSupport: Pointer;
}
export declare class TouchVisualizer extends Actor<TouchVisualizerProps> {
    onActivate(): void;
}
