import { ReadOnlyObservable, ReadOnlyObservableArray } from "@anderjason/observable";
export declare type UndoClearBehavior = "keepCurrent" | "clearAll";
export declare class UndoContext<T = any> {
    private _output;
    readonly output: ReadOnlyObservable<T>;
    private _currentIndex;
    readonly currentIndex: ReadOnlyObservable<number>;
    private _steps;
    readonly steps: ReadOnlyObservableArray<T>;
    private _canUndo;
    readonly canUndo: ReadOnlyObservable<boolean>;
    private _canRedo;
    readonly canRedo: ReadOnlyObservable<boolean>;
    private _limit;
    constructor(initialValue: T, limit: number);
    pushStep(step: T): void;
    replaceStep(step: T): void;
    undo(): boolean;
    redo(): boolean;
    clearSteps(clearBehavior: UndoClearBehavior): void;
    private setCurrentIndex;
}
