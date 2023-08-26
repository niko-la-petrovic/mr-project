import {
  ImageFlowEdge,
  ImageFlowNode,
  ImageFlowNodeTypes,
  nameof,
} from '@/types/domain'

import { OperationName } from '@/services/imageOps'
import { createNode } from '@/services/nodeOps'

const picsumSource = createNode(
  '1',
  'Image Source',
  {
    x: 0,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.PicsumSource,
  undefined,
  true,
)

const gaussianBlur = createNode(
  '2',
  'Gaussian Blur',
  {
    x: 0,
    y: 450,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Gaussian,
  [3],
)

const invert = createNode(
  '3',
  'Invert',
  {
    x: 450,
    y: 450,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Invert,
  undefined,
  true,
)

const grayscale = createNode(
  '4',
  'Grayscale',
  {
    x: 0,
    y: 900,
  },
  // TODO make this default
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Grayscale,
  undefined,
  true,
)

const sepia = createNode(
  '5',
  'Sepia',
  {
    x: 450,
    y: 900,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Sepia,
  undefined,
  true,
)

const brightness = createNode(
  '6',
  'Brightness',
  {
    x: 900,
    y: 900,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Brightness,
  [0.5],
  true,
)

const inversion1 = createNode(
  '7',
  'Invert',
  {
    x: 0,
    y: 1350,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Invert,
  undefined,
  true,
)

const composite = createNode(
  '8',
  'Composite',
  {
    x: 450,
    y: 1350,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Composite,
  [0.5, 1, { x: 0, y: 0 }],
  true,
)

const picsumSource1 = createNode(
  '9',
  'Image Source',
  {
    x: 900,
    y: 1350,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.PicsumSource,
  undefined,
  true,
)

export const initialNodes: ImageFlowNode[] = [
  picsumSource,
  gaussianBlur,
  invert,
  grayscale,
  sepia,
  brightness,
  inversion1,
  composite,
  picsumSource1,
]
export const initialEdges: ImageFlowEdge[] = [
  {
    id: 'e1-2',
    source: picsumSource.id,
    target: gaussianBlur.id,
  },
  {
    id: 'e2-3',
    source: gaussianBlur.id,
    target: invert.id,
  },
  {
    id: 'e3-4',
    source: invert.id,
    target: grayscale.id,
  },
  {
    id: 'e3-5',
    source: invert.id,
    target: sepia.id,
  },
  {
    id: 'e3-6',
    source: invert.id,
    target: brightness.id,
  },
  {
    id: 'e4-7',
    source: grayscale.id,
    target: inversion1.id,
  },
  {
    id: 'e9-8',
    source: picsumSource1.id,
    target: composite.id,
  },
  {
    id: 'e1-8',
    source: picsumSource.id,
    target: composite.id,
  },
]
