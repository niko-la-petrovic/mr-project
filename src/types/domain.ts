import { Edge, Node, NodeProps } from "reactflow";

import Jimp from "jimp/*";
import { ReactNode } from "react";

// TODO reduce this to just the types we need
export interface Image extends Jimp {}
export type ImageMemo = {
  image: Image;
  thumbnail: string;
};

export type GraphNodeData<TContent = undefined> = {
  label: string;
  content?: TContent | undefined;
};

export type ImageFlowEdgeData<
  TImage = Image,
  TImageMemo = ImageMemo
> = NonPreviewable<MemoizedImageFunction<TImage, TImageMemo>>;
export type ImageFlowEdge = Edge<ImageFlowEdgeData | undefined>;

export type OperationReturnType<TImage = Image> = Promise<TImage | undefined>;

// TODO make this many images

export interface SingleImageFunction<TImage = Image> {
  (image: TImage): OperationReturnType<TImage>;
}

export interface ImageFunction<TImage = Image> {
  (images: TImage[]): OperationReturnType<TImage>;
}

export interface Previewable {
  showPreview?: boolean;
}

export type NonPreviewable<T> = Omit<T, keyof Previewable>;

export interface MemoizedImageFunction<TImage = Image, TMemoImage = ImageMemo>
  extends Previewable {
  memo?: TMemoImage | null;
  operation?: ImageFunction<TImage>;
}

// TODO intersect/union to make content required
export type ImageFlowNodeData<
  TImage = Image,
  TMemoImage = ImageMemo
> = MemoizedImageFunction<TImage, TMemoImage>;

export type ImageFlowData = GraphNodeData<
  MemoizedImageFunction<Image, ImageMemo>
>;

export type ImageFlowNode = Node<ImageFlowData>;
export type ImageFlowNodeProps = NodeProps<ImageFlowData>;

export type ImageFlowNodeTypes = {
  imageFlowNode: (props: ImageFlowNodeProps) => ReactNode;
};

export type NodeEdgePair = {
  node: ImageFlowNode;
  edge?: ImageFlowEdge;
};

export interface HasParent {
  parent?: ImageFlowNode;
}

export type OperationInputPair = NodeEdgePair & HasParent;

export type OperationOutput = ImageMemo;

export const nameof = <T>(name: Extract<keyof T, string>): string => name;
