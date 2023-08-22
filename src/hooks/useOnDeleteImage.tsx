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
      const descendants = getDescendants(
        prevNodes,
        getEdges(),
        nodeToRemove.id,
      ).map((n) => ({
        ...n,
        data: { ...n.data, content: { ...n.data.content, memo: undefined } },
      }))

      const updatedNodes = prevNodes
        .map((n) => {
          if (n.id === nodeId) return undefined

          const foundInDescendants = descendants.find((d) => d.id === n.id)
          if (foundInDescendants) return foundInDescendants

          return n
        })
        .filter((n): n is ImageFlowNode => !!n)

      return updatedNodes
    })
  }, [setNodes, getEdges, nodeId])
}
