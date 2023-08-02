import { Edge, Position, XYPosition } from "reactflow";
import {
  Image,
  ImageFlowEdgeData,
  ImageFunction,
  ImageMemo,
  OperationInputPair,
  OperationOutput,
} from "@/types/domain";

import { ImageFlowNode } from "@/types/domain";
import Jimp from "jimp";
import forge from "node-forge";

export const nodeTransformById = (
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

export function setNodeMemo(node: ImageFlowNode, memo: ImageMemo) {
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

export function setNodeMemoById(
  nodes: ImageFlowNode[],
  nodeId: string,
  memo: ImageMemo
) {
  return nodeTransformById(nodes, nodeId, (node) => setNodeMemo(node, memo));
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
  dependentEdges: Edge<ImageFlowEdgeData>[],
  nodes: ImageFlowNode[],
  nodeFuture: ImageFlowNode
) {
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
