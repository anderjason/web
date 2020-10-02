import { ManagedObject } from "skytree";
import { PointerWatcher } from ".";
export interface TouchVisualizerDefinition {
    touchSupport: PointerWatcher;
}
export declare class TouchVisualizer extends ManagedObject<TouchVisualizerDefinition> {
    onActivate(): void;
}
