import { Edge, Node, XYPosition } from 'reactflow'
import {
  Image,
  ImageFlowEdge,
  ImageFunctionParams,
  ImageMemo,
  OperationInputPair,
} from '@/types/domain'
import { OperationConversion, OperationName } from './imageOps'

import { ImageFlowNode } from '@/types/domain'
import Jimp from 'jimp'

export const deepNodeTransformById = (
  nodes: ImageFlowNode[],
  id: string,
  transformation: (node: ImageFlowNode) => ImageFlowNode,
): ImageFlowNode[] => {
  return nodes.map((node) => {
    if (node.id === id) {
      return transformation(node)
    }
    return node
  })
}

export const shallowNodeTransformById = (
  nodes: ImageFlowNode[],
  id: string,
  transformation: (node: ImageFlowNode) => ImageFlowNode,
): ImageFlowNode[] => {
  nodes.forEach((node) => {
    if (node.id === id) {
      return transformation(node)
    }
    return node
  })
  return nodes
}

/**
 * Calculates a thumbnail of the given image
 * @param {Image} img Image to calculate thumbnail of
 * @returns {Promise<ImageMemo>} Promise that resolves to an ImageMemo
 */
export const calculateThumbnail: (img: Image) => Promise<ImageMemo> = (
  img: Image,
) => {
  return new Promise((resolve, reject) => {
    img
      .clone()
      .resize(256, 256)
      .quality(60)
      .getBase64Async(Jimp.MIME_JPEG)
      .catch((err) => {
        reject(err)
      })
      .then((base64) => {
        if (base64) {
          resolve({
            image: img,
            thumbnail: base64,
            thumbnailDigest: img.hash(),
          })
        }
      })
  })
}

export function deepSetNodeMemo(node: ImageFlowNode, memo: ImageMemo) {
  return {
    ...node,
    data: {
      ...node.data,
      content: {
        ...node.data.content,
        showPreview: true,
        memo,
      },
    },
  }
}

export function shallowSetNodeMemo(node: ImageFlowNode, memo: ImageMemo) {
  if (node.data?.content === undefined) {
    throw new Error('Node data content is undefined')
  }

  node.data.content.memo = memo
  node.data.content.showPreview = true
  return node
}

/**
 * Returns nodes that have no memo
 * @param {ImageFlowNode[]} nodes Nodes to filter
 * @returns {ImageFlowNode[]} Nodes that have no memo
 */
export function getOnlyMemolessNodes(nodes: ImageFlowNode[]): ImageFlowNode[] {
  return nodes.filter((n) => n.data.content?.memo === undefined)
}

export function getMemolessInputNodes(
  nodes: ImageFlowNode[],
  edges: ImageFlowEdge[],
): ImageFlowNode[] {
  const inputNodes = getInputNodes(edges, nodes)
  return getOnlyMemolessNodes(inputNodes)
}

export function shallowSetNodeMemoById(
  nodes: ImageFlowNode[],
  nodeId: string,
  memo: ImageMemo,
) {
  return shallowNodeTransformById(nodes, nodeId, (node) =>
    shallowSetNodeMemo(node, memo),
  )
}

export function deepSetNodeMemoById(
  nodes: ImageFlowNode[],
  nodeId: string,
  memo: ImageMemo,
) {
  return deepNodeTransformById(nodes, nodeId, (node) =>
    deepSetNodeMemo(node, memo),
  )
}

export function createNode(
  id: string,
  label: string,
  position: XYPosition,
  type?: string,
  operationName?: OperationName,
  operationArgs?: ImageFunctionParams,
  showPreview?: boolean,
): ImageFlowNode {
  return {
    id,
    type,
    data: {
      label,
      content: {
        operation:
          operationName && OperationConversion(operationName, operationArgs),
        showPreview,
      },
    },
    position,
  }
}

export function getDependentNodeOperationsPairs(
  dependentEdges: Edge[],
  nodes: ImageFlowNode[],
  nodeFuture: ImageFlowNode,
): OperationInputPair[] {
  return dependentEdges
    .map((e) => {
      const foundNode = nodes.find((n): n is ImageFlowNode => n.id === e.target)
      return {
        node: foundNode,
        edge: e,
        parent: nodeFuture,
      } as Partial<OperationInputPair>
    })
    .filter((n): n is OperationInputPair => n.node !== undefined)
}

/**
 * Given edges and a node id, returns edges that depend on the node with the given id. In other words, returns edges that have the node with the given id as their source.
 * @param {TNode[]} edges Edges of a graph
 * @param {string} nodeId Id of a node
 * @returns {TNode[]} Edges that depend on the node with the given id
 */
export function filterDependentEdges<TEdge extends Edge>(
  edges: TEdge[],
  nodeId: string,
): TEdge[] {
  return edges.filter((e) => e.source === nodeId)
}

// TODO use graph type as input
/**
 * Takes in edges and nodes of a graph and returns input nodes - nodes that have no input edges
 * @param {TEdge[]} edges
 * @param {TNode[]} nodes
 * @returns {TNode[]} Input nodes - nodes that have no input edges
 */
export function getInputNodes<TEdge extends Edge, TNode extends Node>(
  edges: TEdge[],
  nodes: TNode[],
): TNode[] {
  return nodes.filter((n) => !edges.find((e) => e.target === n.id))
}

// TODO use graph type as input
/**
 * Takes in edges and nodes of a graph and returns output nodes - nodes that have no output edges
 * @param {TEdge[]} edges
 * @param {TNode[]} nodes
 * @returns {TNode[]} Output nodes - nodes that have no output edges
 */
export function getOutputNodes<TEdge extends Edge, TNode extends Node>(
  edges: TEdge[],
  nodes: TNode[],
): TNode[] {
  return nodes.filter((n) => !edges.find((e) => e.source === n.id))
}

// TODO refactor
export function performOperation(
  edges: ImageFlowEdge[],
  getNodes: () => ImageFlowNode[],
  setNodes: (
    updaterFunction: (nodes: ImageFlowNode[]) => ImageFlowNode[],
  ) => void,
  ...pairsToUpdate: OperationInputPair[]
): void {
  if (pairsToUpdate.length == 0) return

  pairsToUpdate.forEach((pair) => {
    const node = pair.node
    const nodeId = node.id
    const nodeMemo = node.data.content?.memo
    const nodeOperation = node.data.content?.operation

    // TODO use edge operation

    const updatedParent = pair.parent
    const updatedParentId = updatedParent?.id
    const hasUpdatedParent = updatedParent !== undefined
    const updatedParentMemo = updatedParent?.data.content?.memo
    const hasUpdatedParentImage = updatedParentMemo !== undefined
    const clonedUpdatedParentImage = updatedParentMemo?.image.clone()

    const parentEdges = edges.filter(
      (e) => e.target === nodeId && e.source !== updatedParentId,
    )
    const parentNodes = parentEdges.map((e) =>
      getNodes().find((n) => n.id === e.source),
    )
    const parentNodesImages = parentNodes
      .map((n) => n?.data.content?.memo?.image.clone())
      .filter((i): i is Image => i !== undefined)
    // TODO add ordering for parent nodes or to their edges (i think ordering the edges is better)

    const inputImages = clonedUpdatedParentImage
      ? [clonedUpdatedParentImage, ...parentNodesImages]
      : []

    nodeOperation &&
      !nodeMemo &&
      (hasUpdatedParent ? hasUpdatedParentImage : true) &&
      nodeOperation
        .function(inputImages)
        .then((img) => {
          img &&
            calculateThumbnail(img).then((out) => {
              traceOperation(
                hasUpdatedParent,
                inputImages,
                out.image,
                nodeId,
                updatedParent,
              )

              const nodeFuture: ImageFlowNode = deepSetNodeMemo(node, out)
              setNodes((prev) => deepSetNodeMemoById(prev, nodeId, out))

              const dependentEdges = filterDependentEdges(edges, nodeId)
              const dependentPairs = getDependentNodeOperationsPairs(
                dependentEdges,
                getNodes(),
                nodeFuture,
              )
              performOperation(edges, getNodes, setNodes, ...dependentPairs)
            })
        })
        .catch((e) => {
          console.debug(
            '💢 Error in operation',
            e,
            `node: ${nodeId}`,
            `"parent: ${updatedParentId}"`,
          )
        })
  })
}

function traceOperation(
  hasParent: boolean,
  parentMemos: Image[],
  out: Image,
  nodeId: string,
  parent: ImageFlowNode | undefined,
) {
  const hasInputs = parentMemos.length > 0
  const parentThumbnailDigest =
    hasParent && hasInputs
      ? parentMemos.map((image) => image.hash()).join(', ')
      : ''
  const outDigest = out.hash()
  console.debug(
    'node: ' + nodeId,
    hasParent ? 'parentId: ' + parent?.id : '',
    hasInputs ? '->' + parentThumbnailDigest : '',
    '->' + outDigest,
  )
}

/**
 * Returns nodes that are descendants of the node with the given id
 * @param {ImageFlowNode[]} nodes Nodes of a graph
 * @param {ImageFlowEdge[]} edges Edges of a graph
 * @param {string} nodeId Id of a node
 * @returns {ImageFlowNode[]} Nodes that are descendants of the node with the given id
 */
export function getDescendants(
  nodes: ImageFlowNode[],
  edges: ImageFlowEdge[],
  nodeId: string | undefined,
): ImageFlowNode[] {
  if (nodeId === undefined) return []

  const directDescendantEdges = edges.filter((e) => e.source === nodeId)
  const directDescendantNodes = directDescendantEdges
    .map((e) => nodes.find((n) => n.id === e.target))
    .filter((n): n is ImageFlowNode => n !== undefined)

  const descendantNodes = directDescendantNodes.flatMap((n) =>
    getDescendants(nodes, edges, n.id),
  )

  return [...directDescendantNodes, ...descendantNodes]
}
