import { dataUrlGivenUrl } from "./_internal/dataUrlGivenUrl";
import { blobGivenUrl } from "./_internal/blobGivenUrl";
import { imageBitmapGivenUrl } from "./_internal/imageBitmapGivenUrl";
import { scriptGivenUrl } from "./_internal/scriptGivenUrl";
import { dataUrlGivenBlob } from "./_internal/dataUrlGivenBlob";
export declare class NetworkUtil {
    static blobGivenUrl: typeof blobGivenUrl;
    static dataUrlGivenUrl: typeof dataUrlGivenUrl;
    static dataUrlGivenBlob: typeof dataUrlGivenBlob;
    static imageBitmapGivenUrl: typeof imageBitmapGivenUrl;
    static scriptGivenUrl: typeof scriptGivenUrl;
}
