import {
  Image,
  ImageFunction,
  OperationOutput,
  OperationReturnType,
} from "@/types/domain";

import Jimp from "jimp";

export function PicsumSourceOperation(): OperationReturnType {
  return Jimp.read("https://picsum.photos/200");
}

export function GaussianOperation(
  r: number,
  ...images: Image[]
): OperationReturnType {
  if (images.length !== 1) return Promise.resolve(undefined);

  return Promise.resolve(images[0].gaussian(r));
}

export function InvertOperation(...images: Image[]): OperationReturnType {
  if (images.length !== 1) return Promise.resolve(undefined);

  return Promise.resolve(images[0].invert());
}

export function BlurOperation(
  r: number,
  ...images: Image[]
): OperationReturnType {
  if (images.length !== 1) return Promise.resolve(undefined);

  return Promise.resolve(images[0].blur(r));
}

export const operations = {
  PicsumSourceOperation,
  GaussianOperation,
  InvertOperation,
  BlurOperation,
};
