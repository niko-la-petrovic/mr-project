import {
  DoubleImageFunction,
  Image,
  ImageFunctionParams,
  Operation,
  OperationReturnType,
  SingleImageFunction,
} from '@/types/domain'
import { thumbnailHeight, thumbnailWidth } from './nodeOps'

import Jimp from 'jimp'
import { curry } from 'lodash'
import { inferenceSqueezeNet } from './onnx/predict'

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
  positionX: number,
  positionY: number,
  images: Image[],
): OperationReturnType {
  return DoubleImageOperation(
    (image1, image2) =>
      Promise.resolve(
        image1.composite(image2, positionX, positionY, {
          mode: Jimp.BLEND_DESTINATION_OVER,
          opacitySource,
          opacityDest: opacityDestination,
        }),
      ),
    images,
  )
}

export function ClassifyImageOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation((image) => {
    console.debug(image)
    return new Promise((resolve, reject) => {
      inferenceSqueezeNet(image).then((predictionResult) => {
        console.debug(predictionResult.prediction.map((p) => p.name))
        return new Jimp(
          thumbnailWidth,
          thumbnailHeight,
          '#ffffff',
          async (err, image) => {
            // TODO error handling
            // TODO fix callback hell
            if (err) reject(err)

            // TODO fix font loading - read from .env
            // also use webpack module to rewrite the path in the Inter.fnt file using a param from .env
            const font = await Jimp.loadFont(
              'https://next-dev.nikola-petrovic.com/Inter.fnt',
            )
            resolve(
              image.print(
                font,
                20,
                thumbnailHeight / 2,
                predictionResult.prediction[0].name,
              ),
            )
          },
        )
      })
    })
  }, images)
}

export function LoadOneAtRandomFromUrlsOperation(
  imageUrls: string[],
  images: Image[],
): OperationReturnType {
  const imageUrl = imageUrls[Math.floor(Math.random() * imageUrls.length)]
  console.log(imageUrl)
  return SingleImageOperation(() => Jimp.read(imageUrl), images)
}

export function LoadFromUrlOperation(
  url: string,
  images: Image[],
): OperationReturnType {
  return SingleImageOperation(() => Jimp.read(url), images)
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

const tooManyArgumentsPromise = () => Promise.reject('Too many arguments')

const firstImage = (images: Image[]): Image => {
  return images[0]
}

export function getImageUrlAsync(image: Image): Promise<string> {
  return image.getBase64Async(Jimp.MIME_PNG)
}

export enum OperationName {
  PicsumSource = 'picsumSource',
  Gaussian = 'gaussian',
  Invert = 'invert',
  Blur = 'blur',
  Grayscale = 'grayscale',
  Sepia = 'sepia',
  Brightness = 'brightness',
  Composite = 'composite',
  ClassifyImage = 'classifyImage',
  LoadFromUrl = 'loadFromUrl',
  LoadOneAtRandomFromUrls = 'loadOneAtRandomFromUrls',
}

export const OperationMap = {
  [OperationName.PicsumSource]: PicsumSourceOperation,
  [OperationName.Gaussian]: GaussianOperation,
  [OperationName.Invert]: InvertOperation,
  [OperationName.Blur]: BlurOperation,
  [OperationName.Grayscale]: GrayscaleOperation,
  [OperationName.Sepia]: SepiaOperation,
  [OperationName.Brightness]: BrightnessOperation,
  [OperationName.Composite]: CompositeOperation,
  [OperationName.ClassifyImage]: ClassifyImageOperation,
  [OperationName.LoadFromUrl]: LoadFromUrlOperation,
  [OperationName.LoadOneAtRandomFromUrls]: LoadOneAtRandomFromUrlsOperation,
}

export function OperationConversion(
  operationName: OperationName,
  operationArgs?: ImageFunctionParams,
): Operation<Image> {
  console.group(operationName)
  console.debug('args', operationArgs)
  const arglessOperation = OperationMap[operationName]
  console.debug('operation', arglessOperation)
  console.groupEnd()

  const curriedArglessOperation = curry(arglessOperation)
  const operation =
    ((operationArgs && operationArgs.length) ?? 0) > 0
      ? curry(arglessOperation)(...(operationArgs ?? []))
      : curriedArglessOperation
  return {
    name: operationName,
    function: operation,
  }
}
