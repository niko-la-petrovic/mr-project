export type GraphNode = {
  id: string;
  position: { x: number; y: number };
};

export type ImageFlowNode = GraphNode & {
  label: string;
};
