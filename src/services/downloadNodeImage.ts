import { Image } from "@/types/domain";
import { getImageUrlAsync } from "./imageOps";
import { saveBlobToFile } from "./saveFile";

export const downloadNodeImage = (image: Image, imageId: string) => {
  // TODO allow for changing the save format
  getImageUrlAsync(image).then((url) => {
    if (!url) return;
    fetch(url)
      .then((response) => response.blob())
      .then((blob) => {
        saveBlobToFile([blob], "image/png", `${imageId}.png`);
      });
  });
};
