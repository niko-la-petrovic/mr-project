import { ImageFlowNode } from "@/types/domain";
import { deepNodeTransformById } from "./nodeOps";

export const updateNodeLabel = (
  nodeId: string,
  label: string,
  setNodes: (updater: (nodes: ImageFlowNode[]) => ImageFlowNode[]) => void
) => {
  setNodes((nodes) =>
    deepNodeTransformById(nodes, nodeId, (node) => ({
      ...node,
      data: { ...node.data, label },
    }))
  );
};
