import { Actor } from "skytree";
import { Pointer } from ".";
export interface TouchVisualizerDefinition {
    touchSupport: Pointer;
}
export declare class TouchVisualizer extends Actor<TouchVisualizerDefinition> {
    onActivate(): void;
}
