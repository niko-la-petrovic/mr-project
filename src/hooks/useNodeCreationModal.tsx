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
  }
}

export type NodeCreationModalState = {
  isOpen: boolean
  selectedOperation: OperationName
  selectedOperationArgs: ImageFunctionParams
}

export enum NodeCreationModalActionType {
  OpenModal = 'openModal',
  CloseModal = 'closeModal',
  SelectOperation = 'selectOperation',
  SelectOperationArgs = 'selectOperationArgs',
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

const initialState: NodeCreationModalState = {
  isOpen: false,
  selectedOperation: OperationName.PicsumSource,
  selectedOperationArgs: [],
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
  })

export const NodeCreationModalProvider = NodeCreationModalContext.Provider
