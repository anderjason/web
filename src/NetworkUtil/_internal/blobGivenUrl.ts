export async function blobGivenUrl(url: string): Promise<Blob> {
  const response = await fetch(url);
  const blob = await response.blob();

  return blob;
}
