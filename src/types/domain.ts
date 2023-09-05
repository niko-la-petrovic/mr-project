import { Edge, Node, NodeProps } from 'reactflow'

import Jimp from 'jimp/*'
import { OperationName } from '@/services/imageOps'
import { ReactNode } from 'react'
import { WebGPUOperationName } from '@/services/webGPUOps'

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
  name: OperationName
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
  operationArgs?: ImageFunctionParams
  webGPUArgs?: WebGPUArgs
}

export interface WebGPUArgs {
  operationName: WebGPUOperationName
  operation: WebGPUOperation
}

export type PipelineDescriptorGenerator = (
  textureFormat: GPUTextureFormat,
  device: GPUDevice,
) => GPURenderPipelineDescriptor

export type BindGroupDescriptorGenerator = (
  pipeline: GPURenderPipeline,
  frame: number,
) => GPUBindGroupDescriptor

export type BindGroupBinder = (encoder: GPURenderPassEncoder) => void

export type BufferGenerator = (
  device: GPUDevice,
) => Map<number, Map<number, GPUBuffer>>

export type BindingGroupEntryMap<T> = Map<number, Map<number, T>>

export interface WebGPUOperation {
  pipelineDescriptorGenerator: PipelineDescriptorGenerator
  bindGroupDescriptorGenerator?: BindGroupDescriptorGenerator
  bindGroupBinder?: BindGroupBinder
  bindGroupMap?: BindingGroupEntryMap<GPUBindGroup>
  bufferGenerator?: BufferGenerator
  bufferMap?: BindingGroupEntryMap<GPUBuffer>
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
