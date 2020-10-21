import { Size2 } from "@anderjason/geometry";
import { VideoMetadata } from "../../Preload";

export function videoMetadataGivenUrl(url: string): Promise<VideoMetadata> {
  return new Promise((resolve, reject) => {
    const video = document.createElement("video");

    video.addEventListener(
      "loadedmetadata",
      () => {
        resolve({
          url,
          contentSize: Size2.givenWidthHeight(
            video.videoWidth,
            video.videoHeight
          ),
        });
      },
      false
    );

    video.addEventListener("error", () => {
      reject(new Error("Could not load image"));
    });

    video.src = url;
  });
}
