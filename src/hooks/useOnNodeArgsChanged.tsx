import { Dispatch, SetStateAction, useCallback } from 'react'
import { ImageFlowNode, ImageFunctionParams } from '@/types/domain'

export function useOnNodeArgsChanged(
  setNodes: Dispatch<SetStateAction<ImageFlowNode[]>>,
  nodeId: string,
) {
  // TOOD refactor using one of nodeOps.ts functions
  // TODO issue rerender
  return useCallback(
    (value: ImageFunctionParams) => {
      setNodes((prevNodes) =>
        prevNodes.map((node) => {
          if (node.id === nodeId) {
            return {
              ...node,
              data: {
                ...node.data,
                content: {
                  ...node.data.content,
                  operationArgs: value,
                },
              },
            }
          }
          return node
        }),
      )
    },
    [setNodes, nodeId],
  )
}
