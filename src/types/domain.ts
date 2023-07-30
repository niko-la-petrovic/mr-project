import Jimp from "jimp/*";

export type GraphNodeData<TContent = undefined> = {
  label: string;
  content?: TContent | undefined;
};

export type DefaultGraphNodeType = string | undefined;

export type GraphNode<TData = undefined, TNodeTypes = DefaultGraphNodeType> = {
  id: string;
  type?: TNodeTypes | undefined;
  position: { x: number; y: number };
  data: GraphNodeData<TData>;
};

export type GraphEdge<TContent = undefined> = {
  id: string;
  source: string;
  target: string;
  label?: string | undefined;
  content?: TContent | undefined;
};

// TODO reduce this to just the types we need
export interface Image extends Jimp {}
export type ImageMemo = string;
// TODO make this many images
export interface ImageFunction<TImage = Image> {
  (image?: TImage): Promise<TImage>;
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

export type ImageFlowNode<
  TData = ImageFlowNodeData,
  TNodeTypes = DefaultGraphNodeType
> = GraphNode<TData, TNodeTypes> & {};
