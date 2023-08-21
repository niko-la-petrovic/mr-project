import { Dispatch, SetStateAction, useEffect } from 'react'
import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { performOperation } from '@/services/nodeOps'

export function useImageFlow(
  setEdges: Dispatch<SetStateAction<ImageFlowEdge[]>>,
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  nodesToUpdateGenerator: (
    nodes: ImageFlowNode[],
    edges: ImageFlowEdge[],
  ) => ImageFlowNode[],
) {
  useEffect(() => {
    setEdges((prevEdges) => {
      setNodes((prevNodes) => {
        // TODO refactor this inner function
        // make local copy of nodes
        let localNodes = prevNodes.map((n) => ({ ...n }))
        const setLocalNodes = (
          updaterFunction: (nodes: ImageFlowNode[]) => ImageFlowNode[],
        ) => {
          localNodes = updaterFunction(localNodes)
          setNodes(localNodes)
        }

        const nodesToUpdate = nodesToUpdateGenerator(localNodes, prevEdges)

        // only perform operation if there are input nodes
        nodesToUpdate.length > 0 &&
          performOperation(
            prevEdges,
            () => localNodes,
            setLocalNodes,
            ...nodesToUpdate.map((n) => ({ node: n })),
          )
        return localNodes
      })
      return prevEdges
    })
  }, [nodesToUpdateGenerator, setEdges, setNodes])
}
