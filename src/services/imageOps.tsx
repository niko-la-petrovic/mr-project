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

export function CompositeOperation(
  opacityDestination: number,
  opacitySource: number,
  positionX: number,
  positionY: number,
  blendMode: string, // TODO document the allowed values for this parameter
  images: Image[],
): OperationReturnType {
  return DoubleImageOperation(
    (image1, image2) =>
      Promise.resolve(
        image1.composite(image2, positionX, positionY, {
          mode: blendMode,
          opacitySource,
          opacityDest: opacityDestination,
        }),
      ),
    images,
  )
}

const JimpFontUrl = process.env.NEXT_PUBLIC_JIMP_FONT_URL

export function ClassifyImageOperation(images: Image[]): OperationReturnType {
  return SingleImageOperation((image) => {
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
            if (!JimpFontUrl || JimpFontUrl.length === 0) {
              reject('NEXT_PUBLIC_JIMP_FONT_URL not set')
              return
            }
            const font = await Jimp.loadFont(JimpFontUrl)
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
  console.debug(imageUrl)
  return SingleImageOperation(() => Jimp.read(imageUrl), images)
}

export function LoadFromUrlOperation(
  url: string,
  images: Image[],
): OperationReturnType {
  return SingleImageOperation(() => Jimp.read(url), images)
}

export function BackgroundFromColorOperation(color: string, images: Image[]) {
  return SingleImageOperation(
    () =>
      new Promise((resolve, reject) => {
        new Jimp(thumbnailWidth, thumbnailHeight, color, (err, image) => {
          if (err) reject(err)
          resolve(image)
        })
      }),
    images,
  )
}

export function NoOperation(
  images: Image[],
): Promise<OperationReturnType> | OperationReturnType {
  return SingleImageOperation((image) => Promise.resolve(image), images)
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
  NoOperation = 'noOperation',
  White = 'white',
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
  [OperationName.NoOperation]: NoOperation,
  [OperationName.White]: BackgroundFromColorOperation,
}

// TODO use this map where appropriate
export const OperationDefaultArgsMap = {
  [OperationName.PicsumSource]: [],
  [OperationName.Gaussian]: [5],
  [OperationName.Invert]: [],
  [OperationName.Blur]: [5],
  [OperationName.Grayscale]: [],
  [OperationName.Sepia]: [],
  [OperationName.Brightness]: [0.5],
  [OperationName.Composite]: [0.5, 1, 0, 0, Jimp.BLEND_DESTINATION_OVER],
  [OperationName.ClassifyImage]: [],
  [OperationName.LoadFromUrl]: [
    'https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg',
  ],
  [OperationName.LoadOneAtRandomFromUrls]: [
    [
      'https://i.imgur.com/CzXTtJV.jpg',
      'https://i.imgur.com/OB0y6MR.jpg',
      'https://farm2.staticflickr.com/1533/26541536141_41abe98db3_z_d.jpg',
      'https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg',
      'https://farm3.staticflickr.com/2220/1572613671_7311098b76_z_d.jpg',
      'https://farm7.staticflickr.com/6089/6115759179_86316c08ff_z_d.jpg',
      'https://farm2.staticflickr.com/1090/4595137268_0e3f2b9aa7_z_d.jpg',
      'https://farm4.staticflickr.com/3224/3081748027_0ee3d59fea_z_d.jpg',
      'https://farm8.staticflickr.com/7377/9359257263_81b080a039_z_d.jpg',
      'https://farm9.staticflickr.com/8295/8007075227_dc958c1fe6_z_d.jpg',
    ],
  ],
  [OperationName.NoOperation]: [],
  [OperationName.White]: ['#ffffff'],
}

export function OperationConversion(
  operationName: OperationName,
  operationArgs?: ImageFunctionParams,
): Operation<Image> {
  console.group(operationName)
  console.debug('args', operationArgs)
  const arglessOperation = OperationMap[operationName]
  console.debug('arglessOperation', arglessOperation)
  console.groupEnd()

  const curriedArglessOperation = curry(arglessOperation)
  const operation =
    (operationArgs?.length ?? 0) > 0
      ? curry(arglessOperation)(...(operationArgs ?? []))
      : curriedArglessOperation
  return {
    name: operationName,
    function: operation,
  }
}
