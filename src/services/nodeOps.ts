import {
  Image,
  ImageFunction,
  ImageMemo,
  OperationOutput,
} from "@/types/domain";
import { Position, XYPosition } from "reactflow";

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
    img.clone()
      .resize(256, 256)
      .quality(60)
      .getBase64Async(Jimp.MIME_JPEG)
      .catch((err) => {
        reject(err);
      })
      .then((base64) => {
        if (base64) {
          const md5 = forge.md.md5.create();
          resolve({
            image: img,
            thumbnail: base64,
            thumbnailDigest: md5.update(base64).digest().toHex(),
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
