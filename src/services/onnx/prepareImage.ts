import { Image } from '@/types/domain'
import { Tensor } from 'onnxruntime-web'

export function prepareImageSize(
  image: Image,
  width: number = 224,
  height: number = 224,
) {
  return image.resize(width, height)
}

// TODO document order of dimensions
export function imageToTensor(image: Image, dimensions: number[]): Tensor {
  const imageBufferData = image.bitmap.data
  const [redArray, greenArray, blueArray] = splitRGB(imageBufferData)

  const transposedData = transposeRGB(redArray, greenArray, blueArray)

  const float32Data = prepareFloat32Data(transposedData, dimensions)

  const inputTensor = new Tensor('float32', float32Data, dimensions)
  return inputTensor
}

function prepareFloat32Data(transposedData: number[], dimensions: number[]) {
  const l = transposedData.length
  let i = l

  const float32Data = new Float32Array(dimensions.reduce((a, b) => a * b))
  for (i = 0; i < l; i++) float32Data[i] = transposedData[i] / 255
  return float32Data
}

function splitRGB(
  imageBufferData: Buffer,
): [Array<number>, Array<number>, Array<number>] {
  const [redArray, greenArray, blueArray] = [
    new Array<number>(),
    new Array<number>(),
    new Array<number>(),
  ]

  for (let i = 0; i < imageBufferData.length; i += 4) {
    redArray.push(imageBufferData[i])
    greenArray.push(imageBufferData[i + 1])
    blueArray.push(imageBufferData[i + 2])
    // skip data[i + 3] to filter out the alpha channel
  }

  return [redArray, greenArray, blueArray]
}
function transposeRGB(
  redArray: number[],
  greenArray: number[],
  blueArray: number[],
) {
  return redArray.concat(greenArray).concat(blueArray)
}
