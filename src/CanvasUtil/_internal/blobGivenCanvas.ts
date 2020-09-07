export async function blobGivenCanvas(
  canvas: HTMLCanvasElement,
  type: "image/png" | "image/jpeg" | "image/webp"
): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (blob == null) {
        reject(new Error("Unknown error rendering canvas to blob"));
        return;
      }

      resolve(blob);
    }, type);
  });
}
