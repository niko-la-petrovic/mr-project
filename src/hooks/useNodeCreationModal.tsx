import { createContext, useReducer } from 'react'

import { ImageFunctionParams } from '@/types/domain'
import { OperationName } from '@/services/imageOps'
import { noop } from 'lodash'

export default function useNodeCreationModal() {
  const [state, dispatch] = useReducer(NodeCreationModalReducer, initialState)
  return {
    state,
    dispatch,
    openModal: () => dispatch({ type: NodeCreationModalActionType.OpenModal }),
    closeModal: () =>
      dispatch({ type: NodeCreationModalActionType.CloseModal }),
    selectOperation: (operationName: OperationName) =>
      dispatch({
        type: NodeCreationModalActionType.SelectOperation,
        operationName,
      }),
    selectOperationArgs: (operationArgs: ImageFunctionParams) =>
      dispatch({
        type: NodeCreationModalActionType.SelectOperationArgs,
        operationArgs,
      }),
    setNodeLabel: (nodeLabel: string) =>
      dispatch({
        type: NodeCreationModalActionType.SetNodeLabel,
        nodeLabel,
      }),
  }
}

export type NodeCreationModalState = {
  isOpen: boolean
  selectedOperation: OperationName
  selectedOperationArgs: ImageFunctionParams
  nodeLabel: string
}

export enum NodeCreationModalActionType {
  OpenModal = 'openModal',
  CloseModal = 'closeModal',
  SelectOperation = 'selectOperation',
  SelectOperationArgs = 'selectOperationArgs',
  SetNodeLabel = 'setNodeLabel',
}

export type NodeCreationAction =
  | {
      type: NodeCreationModalActionType.OpenModal
    }
  | {
      type: NodeCreationModalActionType.CloseModal
    }
  | {
      type: NodeCreationModalActionType.SelectOperation
      operationName: OperationName
    }
  | {
      type: NodeCreationModalActionType.SelectOperationArgs
      operationArgs: ImageFunctionParams
    }
  | {
      type: NodeCreationModalActionType.SetNodeLabel
      nodeLabel: string
    }

const initialState: NodeCreationModalState = {
  isOpen: false,
  selectedOperation: OperationName.PicsumSource,
  selectedOperationArgs: [],
  nodeLabel: '',
}

export function NodeCreationModalReducer(
  state: NodeCreationModalState,
  action: NodeCreationAction,
): NodeCreationModalState {
  switch (action.type) {
    case NodeCreationModalActionType.OpenModal:
      return {
        ...state,
        isOpen: true,
      }
    case NodeCreationModalActionType.CloseModal:
      return {
        ...state,
        isOpen: false,
      }
    case NodeCreationModalActionType.SelectOperation:
      return {
        ...state,
        selectedOperation: action.operationName,
      }
    case NodeCreationModalActionType.SelectOperationArgs:
      return {
        ...state,
        selectedOperationArgs: action.operationArgs,
      }
    case NodeCreationModalActionType.SetNodeLabel:
      return {
        ...state,
        nodeLabel: action.nodeLabel,
      }
    default:
      throw new Error('Invalid action type')
  }
}

export type NodeCreationModalContextType = ReturnType<
  typeof useNodeCreationModal
>

export const NodeCreationModalContext =
  createContext<NodeCreationModalContextType>({
    state: initialState,
    dispatch: noop,
    openModal: noop,
    closeModal: noop,
    selectOperation: noop,
    selectOperationArgs: noop,
    setNodeLabel: noop,
  })

export const NodeCreationModalProvider = NodeCreationModalContext.Provider
