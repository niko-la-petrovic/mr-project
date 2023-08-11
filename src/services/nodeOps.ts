import { Edge, Node, XYPosition } from "reactflow";
import {
  Image,
  ImageFlowEdgeData,
  ImageFunction,
  ImageMemo,
  OperationInputPair,
} from "@/types/domain";

import { ImageFlowNode } from "@/types/domain";
import Jimp from "jimp";

export const deepNodeTransformById = (
  nodes: ImageFlowNode[],
  id: string,
  transformation: (node: ImageFlowNode) => ImageFlowNode
): ImageFlowNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return transformation(node);
    }
    return node;
  });
};

export const shallowNodeTransformById = (
  nodes: ImageFlowNode[],
  id: string,
  transformation: (node: ImageFlowNode) => ImageFlowNode
): ImageFlowNode[] => {
  nodes.forEach((node) => {
    if (node.id === id) {
      return transformation(node);
    }
    return node;
  });
  return nodes;
};

export const calculateThumbnail: (img: Image) => Promise<ImageMemo> = (
  img: Image
) => {
  return new Promise((resolve, reject) => {
    img
      .clone()
      .resize(256, 256)
      .quality(60)
      .getBase64Async(Jimp.MIME_JPEG)
      .catch((err) => {
        reject(err);
      })
      .then((base64) => {
        if (base64) {
          resolve({
            image: img,
            thumbnail: base64,
            thumbnailDigest: img.hash(),
          });
        }
      });
  });
};

export function deepSetNodeMemo(node: ImageFlowNode, memo: ImageMemo) {
  return {
    ...node,
    data: {
      ...node.data,
      content: {
        ...node.data.content,
        showPreview: true,
        memo,
      },
    },
  };
}

export function shallowSetNodeMemo(node: ImageFlowNode, memo: ImageMemo) {
  if (node.data?.content === undefined) {
    throw new Error("Node data content is undefined");
  }

  node.data.content.memo = memo;
  node.data.content.showPreview = true;
  return node;
}

export function shallowSetNodeMemoById(
  nodes: ImageFlowNode[],
  nodeId: string,
  memo: ImageMemo
) {
  return shallowNodeTransformById(nodes, nodeId, (node) =>
    shallowSetNodeMemo(node, memo)
  );
}

export function deepSetNodeMemoById(
  nodes: ImageFlowNode[],
  nodeId: string,
  memo: ImageMemo
) {
  return deepNodeTransformById(nodes, nodeId, (node) =>
    deepSetNodeMemo(node, memo)
  );
}

export function createNode(
  id: string,
  label: string,
  position: XYPosition,
  type?: string,
  operation?: ImageFunction,
  showPreview?: boolean
): ImageFlowNode {
  return {
    id,
    type,
    data: {
      label,
      content: {
        operation,
        showPreview,
      },
    },
    position,
  };
}

export function filterDependentNodes(
  dependentEdges: Edge[],
  nodes: ImageFlowNode[],
  nodeFuture: ImageFlowNode
): OperationInputPair[] {
  return dependentEdges
    .map((e) => {
      const foundNode = nodes.find(
        (n): n is ImageFlowNode => n.id === e.target
      );
      return {
        node: foundNode,
        edge: e,
        parent: nodeFuture,
      } as Partial<OperationInputPair>;
    })
    .filter((n): n is OperationInputPair => n.node !== undefined);
}

/**
 * Given edges and a node id, returns edges that depend on the node with the given id. In other words, returns edges that have the node with the given id as their source.
 * @param {TNode[]} edges Edges of a graph
 * @param {string} nodeId Id of a node
 * @returns {TNode[]} Edges that depend on the node with the given id
 */
export function filterDependentEdges<TEdge extends Edge>(
  edges: TEdge[],
  nodeId: string
): TEdge[] {
  return edges.filter((e) => e.source === nodeId);
}

// TODO create a graph type
/**
 * Takes in edges and nodes of a graph and returns input nodes - nodes that have no input edges
 * @param {TEdge[]} edges
 * @param {TNode[]} nodes
 * @returns {TNode[]} Input nodes - nodes that have no input edges
 */
export function getInputNodes<TEdge extends Edge, TNode extends Node>(
  edges: TEdge[],
  nodes: TNode[]
): TNode[] {
  return nodes.filter((n) => !edges.find((e) => e.target === n.id));
}
