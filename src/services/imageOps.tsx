import {
  DoubleImageFunction,
  Image,
  OperationReturnType,
  SingleImageFunction,
} from '@/types/domain'

import Jimp from 'jimp'

export function PicsumSourceOperation(): OperationReturnType {
  return Jimp.read('https://picsum.photos/200')
}

export function SingleImageOperation(
  imageFunction: SingleImageFunction,
  images: Image[],
): OperationReturnType {
  if (moreThanOneArgument(images)) return tooManyArgumentsPromise()

  return imageFunction(firstImage(images))
}

export function DoubleImageOperation(
  imageFunction: DoubleImageFunction,
  images: Image[],
): OperationReturnType {
  if (moreThanTwoArguments(images)) return tooManyArgumentsPromise()
  else if (lessThanTwoArguments(images)) return tooFewArgumentsPromise()

  return imageFunction(images[0], images[1])
}

export function GaussianOperation(
  r: number,
  images: Image[],
): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.gaussian(r)),
    images,
  )
}

export function InvertOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.invert()),
    images,
  )
}

export function BlurOperation(r: number, images: Image[]): OperationReturnType {
  return SingleImageOperation((image) => Promise.resolve(image.blur(r)), images)
}

export function GrayscaleOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.grayscale()),
    images,
  )
}

export function SepiaOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation((image) => Promise.resolve(image.sepia()), images)
}

export function BrightnessOperation(
  r: number,
  images: Image[],
): OperationReturnType {
  return SingleImageOperation(
    (image) => Promise.resolve(image.brightness(r)),
    images,
  )
}

// TODO allow the blend mode to be specified through a parameter
export function CompositeOperation(
  opacityDestination: number,
  opacitySource: number,
  position: { x: number; y: number },
  images: Image[],
): OperationReturnType {
  return DoubleImageOperation(
    (image1, image2) =>
      Promise.resolve(
        image1.composite(image2, position.x, position.y, {
          mode: Jimp.BLEND_DESTINATION_OVER,
          opacitySource,
          opacityDest: opacityDestination,
        }),
      ),
    images,
  )
}

const moreThanOneArgument = (images: Image[]) => {
  return images.length > 1
}

function moreThanTwoArguments(images: Image[]) {
  return images.length > 2
}

export function lessThanTwoArguments(images: Image[]) {
  return images.length < 2
}

export function tooFewArgumentsPromise() {
  return Promise.reject('Too few arguments')
}

// TODO check why this is firing even though it seems like insufficient argument
// TODO also this did work for a second, but it didnt seem to perform the right operation
// TODO debug this issue and see whats happening
const tooManyArgumentsPromise = () => Promise.reject('Too many arguments')

const firstImage = (images: Image[]): Image => {
  return images[0]
}

// TODO update
export const operations = {
  picsumSourceOperation: PicsumSourceOperation,
  gaussianOperation: GaussianOperation,
  invertOperation: InvertOperation,
  blurOperation: BlurOperation,
}

export function getImageUrlAsync(image: Image): Promise<string> {
  return image.getBase64Async(Jimp.MIME_PNG)
}
