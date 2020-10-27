export async function blobGivenUrl(
  url: string,
  init?: RequestInit
): Promise<Blob> {
  const response = await fetch(url, init);
  const blob = await response.blob();

  return blob;
}
