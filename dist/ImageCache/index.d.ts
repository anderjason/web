import { Observable } from "@anderjason/observable";
import { ManagedObject } from "skytree";
export declare class ImageCache extends ManagedObject<void> {
    private _data;
    private _sequenceWorker;
    onActivate(): void;
    ensureUrlReady(url: string, priority?: number): Promise<void>;
    toObservableGivenUrl(url: string, priority?: number): Observable<string>;
    private load;
}
