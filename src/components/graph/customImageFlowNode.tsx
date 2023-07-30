import { Handle, Position, useReactFlow } from "reactflow";
import {
  ImageFlowData,
  ImageFlowEdge,
  ImageFlowEdgeData,
  ImageFlowNode,
  ImageFlowNodeProps,
} from "@/types/domain";
import _, { curry } from "lodash";
import { useCallback, useMemo } from "react";

import Image from "next/legacy/image";
import Input from "../inputs/input";
import { nodeTransform } from "@/services/nodeOps";

// TODO make into container component

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes, getEdge } = useReactFlow<
    ImageFlowData,
    ImageFlowEdgeData
  >();
  const updateNodeLabel = useCallback(
    (label: string) =>
      setNodes((nodes) =>
        nodeTransform(nodes, id, (node) => ({
          ...node,
          data: { ...node.data, label },
        }))
      ),
    [id, setNodes]
  );

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-slate-900 relative rounded gap-4 border-2 border-gray-400 hover:border-primary-600 transition-all duration-300 ease-in-out">
        <span className="absolute top-0 left-0 text-xs font-semibold pl-2 pt-2 opacity-20">
          {id}
        </span>
        <Input
          type="text"
          value={data.label}
          onChange={(value) => updateNodeLabel(value)}
        />
        {data.content?.memo ? (
          <div className="s-64 relative">
            <Image
              className="absolute top-0 left-0 w-full h-full object-contain"
              src={data.content?.memo}
              alt=""
              layout="fill"
            />
          </div>
        ) : (
          <div className="">
            <span>No flow yet</span>
          </div>
        )}
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  );
}
