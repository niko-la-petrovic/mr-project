import "reactflow/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";
import "reactflow/dist/style.css";

import {
  GraphEdge,
  GraphNodeData,
  Image,
  ImageMemo,
  MemoizedImageFunction,
} from "@/types/domain";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  Node,
  NodeProps,
  OnConnect,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import { ReactNode, useCallback, useEffect, useMemo, useState } from "react";

import { CustomImageFlowNode } from "@/components/graph/customImageFlowNode";
import FlowToolbar from "@/components/menus/flowToolbar";
import { Inter } from "next/font/google";
import Jimp from "jimp";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export type ImageFlowData = GraphNodeData<
  MemoizedImageFunction<Image, ImageMemo>
>;
export type ImageFlowNode = Node<ImageFlowData>;
export type ImageFlowNodeProps = NodeProps<ImageFlowData>;

export type ImageFlowNodeTypes = {
  imageFlowNode: (props: ImageFlowNodeProps) => ReactNode;
};
const imageFlowNodeTypes: ImageFlowNodeTypes = {
  imageFlowNode: CustomImageFlowNode,
};

const initialNodes: ImageFlowNode[] = [
  {
    id: "1",
    position: { x: 0, y: 0 },
    type: "imageFlowNode",
    draggable: true,
    data: {
      label: "Image Source",
      content: {
        operation: () => {
          return Jimp.read("https://picsum.photos/200");
        },
        showPreview: true,
      },
    },
  },
  {
    id: "2",
    type: "imageFlowNode",
    position: { x: 0, y: 400 },
    data: { label: "2" },
  },
];
const initialEdges: GraphEdge[] = [{ id: "e1-2", source: "1", target: "2" }];

export default function Home() {
  // TODO useNodesState, ...
  const nodeTypes = useMemo(() => imageFlowNodeTypes, []);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<ImageFlowData>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<GraphEdge[]>(initialEdges);
  const [imgSrc, setImgSrc] = useState<string | undefined>(undefined);

  useEffect(() => {
    // TODO use onnx runtime

    // TODO find starting nodes by finding nodes with no incoming edges

    const startingNodeIndex = 0;
    const operation = nodes[startingNodeIndex].data.content?.operation;
    operation &&
      operation().then((img) => {
        img
          .resize(256, 256)
          .quality(60)
          .getBase64Async(Jimp.MIME_JPEG)
          .then((base64) => {
            console.log(base64);
            // setImgSrc(base64);
            setNodes((prev) => {
              return prev.map((node, index) => {
                if (index === startingNodeIndex) {
                  return {
                    ...node,
                    data: {
                      ...node.data,
                      content: {
                        ...node.data.content,
                        showPreview: true,
                        memo: base64,
                      },
                    },
                  };
                  // TODO update all nodes that depend on this node
                }
                return node;
              });
            });
          });
      });
  }, []);

  const onConnect = useCallback(
    (params: Connection) => setEdges((e) => addEdge(params, e)),
    []
  );

  return (
    <div className={inter.className}>
      <div className="flex flex-col justify-center gap-4 p-4">
        <div className="flex justify-center items-center">
          <span className="text-4xl font-light">Image Flow</span>
        </div>
        {/* TODO use panel as toolbar on mobile? */}
        <FlowToolbar />
        <div className="border border-black dark:border-white mt-0">
          <div className="h-screen w-screen">
            <ReactFlow
              nodes={nodes}
              edges={edges}
              nodeTypes={nodeTypes}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onConnect={onConnect}
            >
              <Controls />
              <MiniMap zoomable pannable />
              <Background gap={12} size={1} />
            </ReactFlow>
          </div>
        </div>
      </div>
    </div>
  );
}
