import { Dispatch, SetStateAction, useCallback } from 'react'
import {
  ImageFlowEdge,
  ImageFlowNode,
  ImageFunctionParams,
} from '@/types/domain'
import {
  clearDescendantMemos,
  mapNodeAndUpdateDescendants,
} from './useOnDeleteImage'

import { OperationConversion } from '@/services/imageOps'
import { imageFlowWithLocalNodes } from './useImageFlow'

export function useOnNodeArgsChanged(
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  getEdges: () => ImageFlowEdge[],
  node: ImageFlowNode,
) {
  // TOOD refactor using one of nodeOps.ts functions
  return useCallback(
    (value: ImageFunctionParams) => {
      const operationName = node.data.content?.operation?.name
      if (!operationName) throw new Error('operationName not found')

      const nodeId = node.id
      console.debug('onArgsChanged', nodeId, value)
      setNodes((prevNodes) => {
        const edges = getEdges()
        const descendants = clearDescendantMemos(prevNodes, () => edges, nodeId)

        let updatedNode: ImageFlowNode | undefined = undefined
        const updatedNodes = mapNodeAndUpdateDescendants(
          prevNodes,
          nodeId,
          descendants,
          (node) => {
            updatedNode = {
              ...node,
              data: {
                ...node.data,
                content: {
                  ...node.data.content,
                  memo: undefined,
                  operationArgs: value,
                  operation: OperationConversion(operationName, value),
                },
              },
            }
            return updatedNode
          },
        )

        const newFlowNodes = imageFlowWithLocalNodes(
          updatedNodes,
          edges,
          setNodes,
          () => [updatedNode!],
        )

        return newFlowNodes
      })
    },
    [node, setNodes, getEdges],
  )
}
