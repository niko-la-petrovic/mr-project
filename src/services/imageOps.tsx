import {
  Image,
  ImageFunction,
  OperationOutput,
  OperationReturnType,
  SingleImageFunction,
} from "@/types/domain";

import Jimp from "jimp";

export function PicsumSourceOperation(): OperationReturnType {
  return Jimp.read("https://picsum.photos/200");
}

export function SingleImageOperation(
  imageFunction: SingleImageFunction,
  images: Image[]
): OperationReturnType {
  if (tooManyArguments(images)) return tooManyArgumentsPromise();

  return imageFunction(firstImage(images));
}

export function GaussianOperation(
  r: number,
  images: Image[]
): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.gaussian(r)),
    images
  );
}

export function InvertOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.invert()),
    images
  );
}

export function BlurOperation(r: number, images: Image[]): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.blur(r)),
    images
  );
}

export function GrayscaleOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.grayscale()),
    images
  );
}

export function SepiaOperation(images: Image[]): OperationReturnType {
  console.log("sepia", images);
  return SingleImageOperation(
    (image) => Promise.resolve(image.sepia()),
    images
  );
}

export function BrightnessOperation(
  r: number,
  images: Image[]
): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.brightness(r)),
    images
  );
}

const tooManyArguments = (images: Image[]) => {
  return images.length > 1;
};

const tooManyArgumentsPromise = () => Promise.reject("Too many arguments");

const firstImage = (images: Image[]): Image => {
  return images[0];
};

// TODO update
export const operations = {
  picsumSourceOperation: PicsumSourceOperation,
  gaussianOperation: GaussianOperation,
  invertOperation: InvertOperation,
  blurOperation: BlurOperation,
};
