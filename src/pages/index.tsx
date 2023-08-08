import "reactflow/dist/style.css";
import "react-tooltip/dist/react-tooltip.css";
import "reactflow/dist/style.css";

import {
  Image,
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNode,
  ImageFlowNodeTypes,
  ImageMemo,
  OperationInputPair,
} from "@/types/domain";
import ReactFlow, {
  Background,
  Connection,
  Controls,
  Edge,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from "reactflow";
import {
  calculateThumbnail,
  filterDependentEdges,
  filterDependentNodes,
  setNodeMemo,
  setNodeMemoById,
} from "@/services/nodeOps";
import { initialEdges, initialNodes } from "@/mock_data/imageFlow";
import { useCallback, useEffect, useMemo } from "react";

import { CustomImageFlowNode } from "@/components/graph/customImageFlowNode";
import FlowToolbar from "@/components/menus/flowToolbar";
import { Inter } from "next/font/google";
import forge from "node-forge";

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
        const nodeMemo = node.data.content?.memo;
        const nodeOperation = node.data.content?.operation;

        // TODO use edge operation

        // TODO check if multiple parents exist for each node

        const updatedParent = pair.parent;
        const updatedParentId = updatedParent?.id;
        const hasUpdatedParent = updatedParent !== undefined;
        const updatedParentMemo = updatedParent?.data.content?.memo;
        const hasUpdatedParentImage = updatedParentMemo !== undefined;
        const clonedUpdatedParentImage = updatedParentMemo?.image.clone();

        const parentEdges = edges.filter(
          (e) => e.target === nodeId && e.source !== updatedParentId
        );
        const parentNodes = parentEdges.map((e) =>
          nodes.find((n) => n.id === e.source)
        );
        const parentNodesImages = parentNodes
          .map((n) => n?.data.content?.memo?.image)
          .filter((i): i is Image => i !== undefined);
        // TODO add ordering for parent nodes or to their edges (i think ordering the edges is better)

        const nodeOperationArgs = clonedUpdatedParentImage
          ? [clonedUpdatedParentImage, ...parentNodesImages]
          : []; // TODO rework condition

        nodeOperation &&
          !nodeMemo &&
          (hasUpdatedParent ? hasUpdatedParentImage : true) &&
          nodeOperation(nodeOperationArgs).then((img) => {
            img &&
              calculateThumbnail(img).then((out) => {
                traceOperation(
                  hasUpdatedParent,
                  updatedParentMemo,
                  out,
                  nodeId,
                  updatedParent
                );

                const nodeFuture: ImageFlowNode = setNodeMemo(node, out);
                setNodes((prev) => setNodeMemoById(prev, nodeId, out));

                const dependentEdges = filterDependentEdges(edges, nodeId);
                const dependentNodes = filterDependentNodes(
                  dependentEdges,
                  nodes,
                  nodeFuture
                );
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

function traceOperation(
  hasParent: boolean,
  parentMemo: ImageMemo | null | undefined,
  out: ImageMemo,
  nodeId: string,
  parent: ImageFlowNode | undefined
) {
  const parentThumbnailDigest =
    hasParent && parentMemo ? parentMemo.image.hash() : "";
  const outThumbnailDigest = out.image.hash();
  console.debug(
    "node: " + nodeId,
    hasParent ? "parentId: " + parent?.id : "",
    parentMemo ? "->" + parentThumbnailDigest : "",
    "->" + outThumbnailDigest
  );
}
