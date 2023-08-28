import { Dispatch, SetStateAction, useCallback } from 'react'
import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { getDescendants } from '@/services/nodeOps'

export function useOnDeleteImage(
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
        nodeToRemove,
      )

      const updatedNodes = removeNodeAndUpdateDescendants(
        prevNodes,
        nodeId,
        descendants,
      )

      return updatedNodes
    })
  }, [setNodes, getEdges, nodeId])
}

export function removeNodeAndUpdateDescendants(
  prevNodes: ImageFlowNode[],
  nodeId: string,
  descendants: ImageFlowNode[],
) {
  return prevNodes
    .map((n) => {
      if (n.id === nodeId) return undefined

      const foundInDescendants = descendants.find((d) => d.id === n.id)
      if (foundInDescendants) return foundInDescendants

      return n
    })
    .filter((n): n is ImageFlowNode => !!n)
}

export function clearDescendantMemos(
  prevNodes: ImageFlowNode[],
  getEdges: () => ImageFlowEdge[],
  parentNode: ImageFlowNode,
): ImageFlowNode[] {
  return getDescendants(prevNodes, getEdges(), parentNode.id).map((n) => ({
    ...n,
    data: { ...n.data, content: { ...n.data.content, memo: undefined } },
  }))
}
