import { Edge, Node, NodeProps } from 'reactflow'

import Jimp from 'jimp/*'
import { ReactNode } from 'react'

// TODO create a graph type
// TODO reduce this to just the types/props we need
export interface Image extends Jimp {}
export type ImageMemo = {
  image: Image
  thumbnail: string
  thumbnailDigest?: string
}

export type GraphNodeData<TContent = undefined> = {
  label: string
  content?: TContent | undefined
}

export type ImageFlowEdgeData<
  TImage = Image,
  TImageMemo = ImageMemo,
> = NonPreviewable<MemoizedImageFunction<TImage, TImageMemo>>
export type ImageFlowEdge = Edge<ImageFlowEdgeData | undefined>

export type OperationReturnType<TImage = Image> = Promise<TImage | undefined>

export interface SingleImageFunction<TImage = Image> {
  (image: TImage): OperationReturnType<TImage>
}

export interface DoubleImageFunction<TImage = Image> {
  (image1: TImage, image2: TImage): OperationReturnType<TImage>
}

export interface Operation<TImage = Image> {
  key: string
  function: (images: TImage[]) => OperationReturnType<TImage>
}

export interface Previewable {
  showPreview?: boolean
}

export type NonPreviewable<T> = Omit<T, keyof Previewable>

export type ImageFunctionParams = (number | boolean | string | object)[]

export interface MemoizedImageFunction<TImage = Image, TMemoImage = ImageMemo>
  extends Previewable {
  memo?: TMemoImage | null
  operation?: Operation<TImage>
  operationParams?: ImageFunctionParams
}

// TODO intersect/union to make content required
export type ImageFlowNodeData<
  TImage = Image,
  TMemoImage = ImageMemo,
> = MemoizedImageFunction<TImage, TMemoImage>

export type ImageFlowData = GraphNodeData<
  MemoizedImageFunction<Image, ImageMemo>
>

export type ImageFlowNode = Node<ImageFlowData>
export type ImageFlowNodeProps = NodeProps<ImageFlowData>

export type ImageFlowNodeTypes = {
  imageFlowNode: (props: ImageFlowNodeProps) => ReactNode
}

export type NodeEdgePair = {
  node: ImageFlowNode
  edge?: ImageFlowEdge
}

export interface HasParent {
  parent?: ImageFlowNode
}

export type OperationInputPair = NodeEdgePair & HasParent

export type OperationOutput = ImageMemo

export const nameof = <T>(name: Extract<keyof T, string>): string => name
