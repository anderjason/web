export function imageBitmapGivenUrl(url: string): Promise<ImageBitmap> {
  return new Promise((resolve, reject) => {
    const img = document.createElement("img");

    img.onload = () => {
      resolve(img as any);
    };

    img.onerror = () => {
      reject(new Error("Could not load image"));
    };

    img.crossOrigin = "anonymous";
    img.src = url;
  });
}
