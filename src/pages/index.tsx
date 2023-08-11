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
  ImageMemo,
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
  filterDependentEdges,
  filterDependentNodes,
  getInputNodes,
  setNodeMemo,
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

const performOperation = (
  edges: ImageFlowEdge[],
  nodes: ImageFlowNode[],
  setNodes: (
    updaterFunction: (nodes: ImageFlowNode[]) => ImageFlowNode[]
  ) => void,
  ...pairsToUpdate: OperationInputPair[]
) => {
  if (pairsToUpdate.length == 0) return;

  pairsToUpdate.forEach((pair) => {
    const node = pair.node;
    const nodeId = node.id;
    const nodeMemo = node.data.content?.memo;
    const nodeOperation = node.data.content?.operation;

    // TODO use edge operation

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
      .map((n) => n?.data.content?.memo?.image.clone())
      .filter((i): i is Image => i !== undefined);
    // TODO add ordering for parent nodes or to their edges (i think ordering the edges is better)

    const inputImages = clonedUpdatedParentImage
      ? [clonedUpdatedParentImage, ...parentNodesImages]
      : [];
    // console.log("inputImages", inputImages);

    // TODO rework condition
    nodeOperation &&
      !nodeMemo &&
      (hasUpdatedParent ? hasUpdatedParentImage : true) &&
      nodeOperation(inputImages)
        .then((img) => {
          img &&
            calculateThumbnail(img).then((out) => {
              traceOperation(
                hasUpdatedParent,
                inputImages,
                out.image,
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
              performOperation(edges, nodes, setNodes, ...dependentNodes);
            });
        })
        .catch((e) => {
          console.error(
            "Error in operation",
            e,
            `node: ${nodeId}`,
            `"parent: ${updatedParentId}"`
          );
        });
  });
};

// TODO useRef for the nodes + useEffect to set modify the nodes
export default function Home() {
  const [nodes, setNodes, onNodesChange] =
    useNodesState<ImageFlowData>(initialNodes);
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<ImageFlowEdgeData>(initialEdges);

  // TODO use onnx runtime

  // TODO document how the passed nodes must be mutable copies
  // TODO check out why the whole tree is being re-rendered twice

  // render the graph on start once - use updater function and no deps
  useEffect(() => {
    setEdges((prevEdges) => {
      setNodes((prevNodes) => {
        // get input nodes without memo
        const inputNodes = getInputNodes(prevEdges, prevNodes).filter(
          (n) => n.data.content?.memo === undefined
        );
        console.debug("inputNodes", inputNodes, prevNodes, prevEdges, setNodes);
        // only perform operation if there are input nodes
        // TODO make local copy of nodes
        // TODO make local setNodes function to update the local nodes
        // TODO use the locally updated nodes to setNodes
        inputNodes.length > 0 &&
          performOperation(
            prevEdges,
            prevNodes,
            setNodes,
            ...inputNodes.map((n) => ({ node: n }))
          );
        return prevNodes;
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
              nodeTypes={imageFlowNodeTypes}
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
  parentMemos: Image[],
  out: Image,
  nodeId: string,
  parent: ImageFlowNode | undefined
) {
  const hasInputs = parentMemos.length > 0;
  const parentThumbnailDigest =
    hasParent && hasInputs
      ? parentMemos.map((image) => image.hash()).join(", ")
      : "";
  const outDigest = out.hash();
  console.debug(
    "node: " + nodeId,
    hasParent ? "parentId: " + parent?.id : "",
    hasInputs ? "->" + parentThumbnailDigest : "",
    "->" + outDigest
  );
}
