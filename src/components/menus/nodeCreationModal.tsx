import { Dispatch, useCallback, useContext } from 'react'
import { ImageFlowNode, ImageFlowNodeTypes, nameof } from '@/types/domain'
import Input, { InputChangeEvent } from '../inputs/input'

import { AiOutlineClose } from 'react-icons/ai'
import { Button } from '../buttons/button'
import { IconButton } from '../buttons/iconButton'
import Modal from 'react-modal'
import { NodeCreationModalContext } from '@/hooks/useNodeCreationModal'
import NodeParamEditor from '../nodeParams/nodeParamEditor'
import { OperationName } from '@/services/imageOps'
import { createNode } from '@/services/nodeOps'
import { font } from '@/pages'

Modal.setAppElement('#__next')

export interface NodeCreationModalProps {
  setNodes: Dispatch<React.SetStateAction<ImageFlowNode[]>>
}

export default function NodeCreationModal({
  setNodes,
}: NodeCreationModalProps) {
  const { state, setNodeLabel, selectOperationArgs, selectOperation, clear } =
    useContext(NodeCreationModalContext)

  const onInput = useCallback(
    (e: InputChangeEvent) => setNodeLabel(e.target.value),
    [setNodeLabel],
  )
  const onAttemptSave = useCallback(() => {
    const valid =
      state.nodeLabel.length > 0 && state.selectedOperation.length > 0
    if (!valid) {
      // TODO display error
      return
    }

    setNodes((prev) => {
      const maxId = prev.reduce((acc, curr) => {
        const currentId = parseInt(curr.id)
        if (currentId > acc) return currentId
        return acc
      }, 1)
      const newNode = createNode(
        (maxId + 1).toString(),
        state.nodeLabel,
        {
          x: 0,
          y: 0,
        },
        nameof<ImageFlowNodeTypes>('imageFlowNode'),
        state.selectedOperation,
        state.selectedOperationArgs,
      )
      return [...prev, newNode]
    })

    clear()
  }, [
    clear,
    setNodes,
    state.nodeLabel,
    state.selectedOperation,
    state.selectedOperationArgs,
  ])
  return (
    <>
      <Modal
        isOpen={state.isOpen}
        style={{
          overlay: {
            zIndex: 20,
          },
        }}
      >
        <div className={`flex flex-col gap-2 ${font.className}`}>
          <div className="flex justify-between">
            <h1 className="text-2xl">Add Node</h1>
            <IconButton onClick={clear}>
              <AiOutlineClose className="text-2xl" />
            </IconButton>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="node-type">Node Type</label>
              <select
                id="node-type"
                className="rounded-md border border-gray-300 p-2 px-4 py-2 transition-colors duration-200 ease-in-out hover:bg-primary-200   active:bg-primary-400 dark:bg-slate-800 dark:hover:bg-primary-700 dark:active:bg-primary-900"
                value={state.selectedOperation}
                onChange={(e) => {
                  selectOperation(e.target.value as OperationName)
                }}
              >
                {Object.entries(OperationName).map(([key, value]) => (
                  <option key={key} value={value}>
                    {key}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="node-name">Node Label</label>
              <Input type="text" value={state.nodeLabel} onChange={onInput} />
            </div>
            <NodeParamEditor
              operationName={state.selectedOperation}
              value={state.selectedOperationArgs}
              onValueChange={selectOperationArgs}
            />
          </div>
          <div className="flex w-full justify-end">
            <Button onClick={onAttemptSave}>
              <span>Save</span>
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
