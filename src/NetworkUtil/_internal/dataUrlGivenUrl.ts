import { blobGivenUrl } from "./blobGivenUrl";
import { dataUrlGivenBlob } from "./dataUrlGivenBlob";

export async function dataUrlGivenUrl(url: string): Promise<string> {
  const blob = await blobGivenUrl(url);
  const dataUrl = await dataUrlGivenBlob(blob);

  return dataUrl;
}
