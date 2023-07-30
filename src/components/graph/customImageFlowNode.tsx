import { Handle, NodeProps, Position } from "reactflow";

import { ImageFlowNodeData } from "@/types/domain";
import { ImageFlowNodeType } from "@/pages";
import { useCallback } from "react";

export interface CustomImageFlowNodeProps
  extends NodeProps<{ data: ImageFlowNodeData }> {}

// TODO use data prop
export function CustomImageFlowNode({ id, data }: CustomImageFlowNodeProps) {
  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex justify-center items-center p-4 w-64 h-8 bg-white relative rounded">
        <span className="absolute top-0 left-0 text-xs font-semibold">{id}</span>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
