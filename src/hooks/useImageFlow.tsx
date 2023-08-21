import { Dispatch, SetStateAction, useEffect } from 'react'
import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { performOperation } from '@/services/nodeOps'

export type GraphNodeGenerator = (
  nodes: ImageFlowNode[],
  edges: ImageFlowEdge[],
) => ImageFlowNode[]

export function useImageFlow(
  setEdges: Dispatch<SetStateAction<ImageFlowEdge[]>>,
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  nodesToUpdateGenerator: GraphNodeGenerator,
) {
  useEffect(() => {
    setEdges((prevEdges) => {
      setNodes((prevNodes) => {
        const localNodes = imageFlowWithLocalNodes(
          prevNodes,
          prevEdges,
          setNodes,
          nodesToUpdateGenerator,
        )
        return localNodes
      })
      return prevEdges
    })
  }, [nodesToUpdateGenerator, setEdges, setNodes])
}

export function imageFlowWithLocalNodes(
  nodes: ImageFlowNode[],
  edges: ImageFlowEdge[],
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  nodesToUpdateGenerator: GraphNodeGenerator,
) {
  // TODO refactor this inner function
  // make local copy of nodes
  let localNodes = nodes.map((n) => ({ ...n }))
  const setLocalNodes = (
    updaterFunction: (nodes: ImageFlowNode[]) => ImageFlowNode[],
  ) => {
    localNodes = updaterFunction(localNodes)
    setNodes(localNodes)
  }

  const nodesToUpdate = nodesToUpdateGenerator(localNodes, edges)

  // only perform operation if there are input nodes
  nodesToUpdate.length > 0 &&
    performOperation(
      edges,
      () => localNodes,
      setLocalNodes,
      ...nodesToUpdate.map((n) => ({ node: n })),
    )
  return localNodes
}
