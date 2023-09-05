import {
  ImageFlowEdge,
  ImageFlowNode,
  ImageFlowNodeTypes,
  nameof,
} from '@/types/domain'
import { createNode, createWebGPUNode } from '@/services/nodeOps'

import Jimp from 'jimp'
import { OperationName } from '@/services/imageOps'
import { WebGPUOperationName } from '@/services/webGPUOps'
import redFragWGSL from '@/shaders/red.frag.wgsl'
import triangleVertWGSL from '@/shaders/triangle.vert.wgsl'

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

const blur = createNode(
  '2',
  'Blur',
  {
    x: 0,
    y: 450,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.Blur,
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
  [0.5, 1, 0, 0, Jimp.BLEND_DESTINATION_OVER],
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

const loadFromUrl = createNode(
  '10',
  'Load From Url',
  {
    x: 450,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.LoadFromUrl,
  ['https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg'],
  true,
)

const classifyImage = createNode(
  '11',
  'Classify Image',
  {
    x: 900,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.ClassifyImage,
  undefined,
  true,
)

const loadOneAtRandomFromUrls = createNode(
  '12',
  'Load One At Random',
  {
    x: 1350,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.LoadOneAtRandomFromUrls,
  [
    [
      'https://i.imgur.com/CzXTtJV.jpg',
      'https://i.imgur.com/OB0y6MR.jpg',
      'https://farm2.staticflickr.com/1533/26541536141_41abe98db3_z_d.jpg',
      'https://farm4.staticflickr.com/3075/3168662394_7d7103de7d_z_d.jpg',
      'https://farm3.staticflickr.com/2220/1572613671_7311098b76_z_d.jpg',
      'https://farm7.staticflickr.com/6089/6115759179_86316c08ff_z_d.jpg',
      'https://farm2.staticflickr.com/1090/4595137268_0e3f2b9aa7_z_d.jpg',
      'https://farm4.staticflickr.com/3224/3081748027_0ee3d59fea_z_d.jpg',
      'https://farm8.staticflickr.com/7377/9359257263_81b080a039_z_d.jpg',
      'https://farm9.staticflickr.com/8295/8007075227_dc958c1fe6_z_d.jpg',
    ],
  ],
  true,
)

const classifyImage1 = createNode(
  '13',
  'Classify Image',
  {
    x: 1350,
    y: 450,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.ClassifyImage,
  undefined,
  true,
)

const webGPUTriangle = createWebGPUNode(
  WebGPUOperationName.Triangle,
  (textureFormat, device) => {
    return {
      layout: 'auto',
      vertex: {
        module: device.createShaderModule({
          code: triangleVertWGSL,
        }),
        entryPoint: 'main',
      },
      fragment: {
        module: device.createShaderModule({
          code: redFragWGSL,
        }),
        entryPoint: 'main',
        targets: [
          {
            format: textureFormat,
          },
        ],
      },
      primitive: {
        topology: 'triangle-list',
      },
    }
  },
  '14',
  'WebGPU Triangle',
  {
    x: -450,
    y: 0,
  },
  nameof<ImageFlowNodeTypes>('imageFlowNode'),
  OperationName.White,
  ['#ffffff'],
  true,
)

export const initialNodes: ImageFlowNode[] = [
  picsumSource,
  blur,
  invert,
  grayscale,
  sepia,
  brightness,
  inversion1,
  composite,
  picsumSource1,
  loadFromUrl,
  classifyImage,
  loadOneAtRandomFromUrls,
  classifyImage1,
  webGPUTriangle,
]

export const initialEdges: ImageFlowEdge[] = [
  {
    id: 'e1-2',
    source: picsumSource.id,
    target: blur.id,
  },
  {
    id: 'e2-3',
    source: blur.id,
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
  {
    id: 'e10-11',
    source: loadFromUrl.id,
    target: classifyImage.id,
  },
  {
    id: 'e11-12',
    source: loadOneAtRandomFromUrls.id,
    target: classifyImage1.id,
  },
]
