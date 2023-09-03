import { Connection, addEdge } from 'reactflow'
import { Dispatch, SetStateAction, useCallback } from 'react'
import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { imageFlowWithLocalNodes } from './useImageFlow'

export default function useOnConnect(
  nodes: ImageFlowNode[],
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  setEdges: Dispatch<SetStateAction<ImageFlowEdge[]>>,
) {
  return useCallback(
    (params: Connection) =>
      setEdges((prevEdges) => {
        const childNode = nodes.find((n) => n.id === params.target)
        if (!childNode) {
          console.error('Parent node not found')
          return prevEdges
        }

        const parentNode = nodes.find((n) => n.id === params.source)
        if (!parentNode) {
          console.error('Child node not found')
          return prevEdges
        }

        console.debug('Adding edge', params, parentNode, childNode)

        const newEdges = addEdge(params, prevEdges) as ImageFlowEdge[]
        const updatedNodes = imageFlowWithLocalNodes(
          nodes,
          newEdges,
          setNodes,
          () => [childNode],
        )
        setNodes(updatedNodes)
        return newEdges
      }),
    [nodes, setEdges, setNodes],
  )
}
