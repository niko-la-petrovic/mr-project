import { Handle, Position, useReactFlow } from "reactflow";
import {
  ImageFlowEdge,
  ImageFlowNode,
  ImageFlowNodeProps,
} from "@/types/domain";

import Image from "next/image";
import { useCallback } from "react";

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes } = useReactFlow<ImageFlowNode, ImageFlowEdge>();
  const updateNodeLabel = useCallback(
    (id: string, label: string) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === id) {
            return {
              ...node,
              data: {
                ...node.data,
                label,
              },
            };
          }
          return node;
        })
      );
    },
    [setNodes]
  );

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col justify-center items-center p-4  bg-white relative rounded gap-2 border-2 border-gray-400 hover:border-primary-600 transition-all duration-300 ease-in-out">
        <span className="absolute top-0 left-0 text-xs font-semibold">
          {id}
        </span>
        <span className="text-xs font-semibold">{data.label}</span>
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
