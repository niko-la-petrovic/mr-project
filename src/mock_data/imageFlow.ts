import {
  BrightnessOperation,
  GaussianOperation,
  GrayscaleOperation,
  InvertOperation,
  PicsumSourceOperation,
  SepiaOperation,
} from "@/services/imageOps";
import {
  ImageFlowEdge,
  ImageFlowNode,
  ImageFlowNodeTypes,
  nameof,
} from "@/types/domain";

import { createNode } from "@/services/nodeOps";
import { curry } from "lodash";

const picsumSource = createNode(
  "1",
  "Image Source",
  {
    x: 0,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  PicsumSourceOperation,
  true
);

const gaussianBlur = createNode(
  "2",
  "Gaussian Blur",
  {
    x: 0,
    y: 400,
  },
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  curry(GaussianOperation)(3),
  true
);

const invert = createNode(
  "3",
  "Invert",
  {
    x: 400,
    y: 400,
  },
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  InvertOperation,
  true
);

const grayscale = createNode(
  "4",
  "Grayscale",
  {
    x: 0,
    y: 800,
  },
  // TODO make this default
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  GrayscaleOperation,
  true
);

const sepia = createNode(
  "5",
  "Sepia",
  {
    x: 400,
    y: 800,
  },
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  SepiaOperation,
  true
);

const brightness = createNode(
  "6",
  "Brightness",
  {
    x: 800,
    y: 400,
  },
  nameof<ImageFlowNodeTypes>("imageFlowNode"),
  curry(BrightnessOperation)(0.5),
  true
);

export const initialNodes: ImageFlowNode[] = [
  picsumSource,
  gaussianBlur,
  invert,
  grayscale,
  sepia,
  brightness,
];
export const initialEdges: ImageFlowEdge[] = [
  {
    id: "e1-2",
    source: picsumSource.id,
    target: gaussianBlur.id,
  },
  {
    id: "e2-3",
    source: gaussianBlur.id,
    target: invert.id,
  },
  {
    id: "e3-4",
    source: invert.id,
    target: grayscale.id,
  },
  {
    id: "e3-5",
    source: invert.id,
    target: sepia.id,
  },
  {
    id: "e3-6",
    source: invert.id,
    target: brightness.id,
  },
];
