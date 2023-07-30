import { Image, ImageMemo, OperationOutput } from "@/types/domain";

import { ImageFlowNode } from "@/types/domain";
import Jimp from "jimp";

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

export const calculateThumbnail: (img: Image) => Promise<OperationOutput> = (
  img: Image
) => {
  return new Promise((resolve, reject) => {
    img
      .resize(256, 256)
      .quality(60)
      .getBase64Async(Jimp.MIME_JPEG)
      .catch((err) => {
        reject(err);
      })
      .then((base64) => {
        if (base64)
          resolve({
            image: img,
            thumbnail: base64,
          });
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
