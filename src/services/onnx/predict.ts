import { InferenceSession, Tensor } from 'onnxruntime-web'
import { isTypedArray, reverse, sortBy, take } from 'lodash'

import { Image } from '@/types/domain'
import imageNetClasses from './imageNetClasses'
import { imageToTensor } from './prepareImage'

export async function inferenceSqueezeNet(
  image: Image,
): Promise<{ prediction: InferenceResult[]; inferenceTime: number }> {
  const resizedImage = image.resize(224, 224)
  const imageTensor = await imageToTensor(resizedImage, [1, 3, 224, 224])
  const [prediction, inferenceTime] = await runSequeezeNetModel(imageTensor)

  return { prediction, inferenceTime }
}

export async function runSequeezeNetModel(
  imageTensor: Tensor,
): Promise<[InferenceResult[], number]> {
  // Create session and set options. See the docs here for more options:
  //https://onnxruntime.ai/docs/api/js/interfaces/InferenceSession.SessionOptions.html#graphOptimizationLevel
  const session = await InferenceSession.create(
    './_next/static/chunks/pages/squeezenet1_1.onnx',
    { executionProviders: ['webgl'], graphOptimizationLevel: 'all' },
  )

  console.debug('Inference session created')
  // Run inference and get results.
  const [results, inferenceTime] = await runInference(session, imageTensor)
  return [results, inferenceTime]
}

export type InferenceResult = {
  id: string
  index: number
  name: string
  probability: number
}

export async function runInference(
  session: InferenceSession,
  preprocessedData: Tensor,
): Promise<[InferenceResult[], number]> {
  const feeds: Record<string, Tensor> = {}
  feeds[session.inputNames[0]] = preprocessedData

  const start = new Date()
  const outputData = await session.run(feeds)
  const end = new Date()

  const inferenceTime = end.getTime() - start.getTime() / 1000

  const output = outputData[session.outputNames[0]]

  // TODO refector this
  const outputSoftmax = softmax(Array.prototype.slice.call(output.data))

  const top5 = getTopK(outputSoftmax, 5)

  return [top5, inferenceTime]
}

export function softmax(array: number[]) {
  // TODO refactor
  // TODO the spread operator might be unnecessary
  const max = Math.max(...array)

  const expSum = array.map((x) => Math.exp(x - max)).reduce((a, b) => a + b)

  return array.map((x) => Math.exp(x - max) / expSum)
}

export function getTopK(
  probabilities: number[],
  k: number = 5,
): InferenceResult[] {
  const probs: number[] = isTypedArray(probabilities)
    ? Array.prototype.slice.call(probabilities)
    : probabilities

  const sorted = reverse(
    sortBy(
      probs.map((prob, index) => [prob, index]),
      (probIndex: Array<number>) => probIndex[0],
    ),
  )

  const topK = take(sorted, k).map(
    (probIndex: Array<number>): InferenceResult => {
      const iClass = imageNetClasses[probIndex[1]]
      return {
        id: iClass[0],
        index: probIndex[1],
        name: iClass[1].replace(/_/g, ' '),
        probability: probIndex[0],
      }
    },
  )

  return topK
}
