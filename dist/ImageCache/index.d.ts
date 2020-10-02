import { Observable } from "@anderjason/observable";
import { ManagedObject } from "skytree";
export declare class ImageCache extends ManagedObject<void> {
    private _data;
    private _sequenceWorker;
    onActivate(): void;
    ensureUrlReady(url: string): Promise<void>;
    toObservableGivenUrl(url: string): Observable<string>;
    private load;
}
