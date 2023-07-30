import { Node, NodeProps } from "reactflow";

import Jimp from "jimp/*";
import { ReactNode } from "react";

// TODO reduce this to just the types we need
export interface Image extends Jimp {}
export type ImageMemo = string;

export type GraphNodeData<TContent = undefined> = {
  label: string;
  content?: TContent | undefined;
};


export type GraphEdge<TContent = undefined> = {
  id: string;
  source: string;
  target: string;
  label?: string | undefined;
  content?: TContent | undefined;
};

// TODO make this many images
export interface ImageFunction<TImage = Image> {
  (...image: TImage[]): Promise<TImage>;
}

export interface MemoizedImageFunction<TImage = Image, TMemoImage = ImageMemo> {
  showPreview: boolean;
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
