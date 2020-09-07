import { dataUrlGivenUrl } from "./_internal/dataUrlGivenUrl";
import { blobGivenUrl } from "./_internal/blobGivenUrl";
import { imageBitmapGivenUrl } from "./_internal/imageBitmapGivenUrl";
import { scriptGivenUrl } from "./_internal/scriptGivenUrl";
import { dataUrlGivenBlob } from "./_internal/dataUrlGivenBlob";

export class NetworkUtil {
  static blobGivenUrl = blobGivenUrl;
  static dataUrlGivenUrl = dataUrlGivenUrl;
  static dataUrlGivenBlob = dataUrlGivenBlob;
  static imageBitmapGivenUrl = imageBitmapGivenUrl;
  static scriptGivenUrl = scriptGivenUrl;
}
