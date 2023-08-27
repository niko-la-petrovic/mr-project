import { AiOutlineClose } from 'react-icons/ai'
import { IconButton } from '../buttons/iconButton'
import Input from '../inputs/input'
import Modal from 'react-modal'
import { NodeCreationModalContext } from '@/hooks/useNodeCreationModal'
import { OperationName } from '@/services/imageOps'
import { font } from '@/pages'
import { useContext } from 'react'

Modal.setAppElement('#__next')

export default function NodeCreationModal() {
  const { state, closeModal, setNodeLabel } = useContext(
    NodeCreationModalContext,
  )

  const onInput = (value: string) => setNodeLabel(value)

  return (
    <>
      <Modal
        isOpen={state.isOpen}
        style={{
          overlay: {
            zIndex: 20,
          },
        }}
        overlayClassName=""
      >
        <div className={`flex flex-col gap-2 ${font.className}`}>
          <div className="flex justify-between">
            <h1 className="text-2xl">Add Node</h1>
            <IconButton onClick={closeModal}>
              <AiOutlineClose className="text-2xl" />
            </IconButton>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex flex-col gap-2">
              <label htmlFor="node-type">Node Type</label>
              <select
                id="node-type"
                className="rounded-md border border-gray-300"
              >
                {Object.keys(OperationName).map((operationName) => (
                  <option key={operationName} value={operationName}>
                    {operationName}
                  </option>
                ))}
              </select>
            </div>
            <div className="flex flex-col gap-2">
              <label htmlFor="node-name">Node Label</label>
              <Input type="text" value={state.nodeLabel} onChange={onInput} />
            </div>
          </div>
        </div>
      </Modal>
    </>
  )
}
