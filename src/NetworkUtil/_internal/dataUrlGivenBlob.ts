export async function dataUrlGivenBlob(blob: Blob | File): Promise<string> {
  return new Promise((resolve, reject) => {
    const fileReader = new FileReader();

    fileReader.onloadend = () => {
      resolve(fileReader.result as string);
    };

    fileReader.onerror = () => {
      reject(fileReader.error);
    };

    fileReader.readAsDataURL(blob);
  });
}
