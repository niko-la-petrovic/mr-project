import "reactflow/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";
import "reactflow/dist/style.css";

import {
  Image,
  ImageFlowData,
  ImageFlowEdge,
  ImageFlowEdgeData,
  ImageFlowNode,
  ImageFlowNodeTypes,
  OperationInputPair,
} from "@/types/domain";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  calculateThumbnail,
  deepSetNodeMemo,
  deepSetNodeMemoById,
  filterDependentEdges,
  filterDependentNodes,
  getInputNodes,
  performOperation,
} from "@/services/nodeOps";
import { initialEdges, initialNodes } from "@/mock_data/imageFlow";
import { useCallback, useEffect, useMemo } from "react";

import { CustomImageFlowNode } from "@/components/graph/customImageFlowNode";
import FlowToolbar from "@/components/menus/flowToolbar";
import { Inter } from "next/font/google";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

const imageFlowNodeTypes: ImageFlowNodeTypes = {
  imageFlowNode: CustomImageFlowNode,
};

export default function Home() {
  const nodeTypes = useMemo<ImageFlowNodeTypes>(() => imageFlowNodeTypes, []);
  const [nodes, setNodes, onNodesChange] =
    useNodesState<ImageFlowData>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<ImageFlowEdgeData>(initialEdges);

  // TODO use onnx runtime

  // TODO document
  // render the graph on start once
  useEffect(() => {
    setEdges((prevEdges) => {
      setNodes((prevNodes) => {
        // TODO refactor this inner function
        // make local copy of nodes
        let localNodes = prevNodes.map((n) => ({ ...n }));
        const setLocalNodes = (
          updaterFunction: (nodes: ImageFlowNode[]) => ImageFlowNode[]
        ) => {
          localNodes = updaterFunction(localNodes);
          setNodes(localNodes);
        };

        // get input nodes without memo
        const inputNodes = getInputNodes(prevEdges, localNodes).filter(
          (n) => n.data.content?.memo === undefined
        );
        // only perform operation if there are input nodes
        inputNodes.length > 0 &&
          performOperation(
            prevEdges,
            () => localNodes,
            setLocalNodes,
            ...inputNodes.map((n) => ({ node: n }))
          );
        return localNodes;
      });
      return prevEdges;
    });
  }, [setEdges, setNodes]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((e) => addEdge(params, e)),
    [setEdges]
  );

  return (
    <div className={inter.className}>
      {/* TOOD Remove full padding around the whole thing */}
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
