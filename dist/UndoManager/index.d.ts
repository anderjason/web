import { ReadOnlyObservable } from "@anderjason/observable";
export declare class UndoManager<T = any> {
    private _currentStep;
    readonly currentStep: ReadOnlyObservable<T>;
    private _undoStack;
    private _redoStack;
    private _canUndo;
    readonly canUndo: ReadOnlyObservable<boolean>;
    private _canRedo;
    readonly canRedo: ReadOnlyObservable<boolean>;
    private _limit;
    constructor(initialValue: T, limit: number);
    addStep(step: T): void;
    undo(): boolean;
    redo(): boolean;
    clearSteps(): void;
}
