import "reactflow/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";
import "reactflow/dist/style.css";

import {
  ImageFlowData,
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
  setNodeMemoById,
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
  const nodeTypes = useMemo(() => imageFlowNodeTypes, []);

  const [nodes, setNodes, onNodesChange] =
    useNodesState<ImageFlowData>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<ImageFlowEdgeData>(initialEdges);

  // TODO use onnx runtime

  // TODO document how the passed nodes must be mutable copies
  const performOperation = useCallback(
    (...pairsToUpdate: OperationInputPair[]) => {
      if (pairsToUpdate.length == 0) return;

      pairsToUpdate.forEach((pair) => {
        const node = pair.node;
        const nodeId = node.id;

        // TODO use edge operation
        const parentEdge = pair.edge;

        const parent = pair.parent;
        const hasParent = parent !== undefined;
        const parentImage = parent?.data.content?.memo?.image;
        const nodeOperationArgs = hasParent && parentImage ? [parentImage] : [];

        const operation = node.data.content?.operation;
        operation &&
          !node.data.content?.memo &&
          operation(nodeOperationArgs).then((img) => {
            img &&
              calculateThumbnail(img).then((out) => {
                // TODO fix - for some reason the sibling node being modified propagates to its sibling nodes
                const nodeFuture: ImageFlowNode = {
                  ...node,
                  data: {
                    ...node.data,
                    content: { ...node.data.content, memo: out },
                  },
                };
                setNodes((prev) => setNodeMemoById(prev, nodeId, out));

                const dependentEdges = edges.filter((e) => e.source === nodeId);
                const dependentNodes = dependentEdges
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
                performOperation(...dependentNodes);
              });
          });
      });
    },
    [edges, nodes, setNodes]
  );

  useEffect(() => {
    // TODO find starting nodes by finding nodes with no incoming edges

    const startingNodeIndex = 0;
    const node = nodes[startingNodeIndex];
    if (node.data.content?.memo) return;

    performOperation({ node });
  }, [nodes, performOperation]);

  const onConnect = useCallback(
    (params: Connection) => setEdges((e) => addEdge(params, e)),
    [setEdges]
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
