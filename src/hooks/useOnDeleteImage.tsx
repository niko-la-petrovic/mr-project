import { Dispatch, SetStateAction, useCallback } from 'react'
import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { getDescendants } from '@/services/nodeOps'

export function useOnNodeDeleteImage(
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  getEdges: () => ImageFlowEdge[],
  nodeId: string,
) {
  return useCallback(() => {
    console.debug('delete node')
    setNodes((prevNodes) => {
      const nodeToRemove = prevNodes.find((n) => n.id === nodeId)
      if (!nodeToRemove) {
        console.warn('no node to remove')
        return prevNodes
      }

      // clear memoized images from descendants
      const descendants = clearDescendantMemos(
        prevNodes,
        getEdges,
        nodeToRemove.id,
      )

      // remove parent node and update descendants
      const updatedNodes = mapNodeAndUpdateDescendants(
        prevNodes,
        nodeId,
        descendants,
        () => undefined,
      )

      return updatedNodes
    })
  }, [setNodes, getEdges, nodeId])
}

export function mapNodeAndUpdateDescendants(
  prevNodes: ImageFlowNode[],
  nodeId: string,
  descendants: ImageFlowNode[],
  mapNode: (n: ImageFlowNode) => ImageFlowNode | undefined,
) {
  return prevNodes
    .map((n) => {
      if (n.id === nodeId) return mapNode(n)

      const foundInDescendants = descendants.find((d) => d.id === n.id)
      if (foundInDescendants) return foundInDescendants

      return n
    })
    .filter((n): n is ImageFlowNode => !!n)
}

export function clearDescendantMemos(
  prevNodes: ImageFlowNode[],
  getEdges: () => ImageFlowEdge[],
  parentNodeId: string,
): ImageFlowNode[] {
  return getDescendants(prevNodes, getEdges(), parentNodeId).map((n) => ({
    ...n,
    data: { ...n.data, content: { ...n.data.content, memo: undefined } },
  }))
}
