import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeProps,
  ImageFunctionParams,
} from '@/types/domain'

import { GridLoader } from 'react-spinners'
import { IconButton } from '../buttons/iconButton'
import Image from 'next/legacy/image'
import Input from '../inputs/input'
import NodeParamEditor from '../nodeParams/nodeParamEditor'
import { downloadNodeImage } from '@/services/downloadNodeImage'
import { updateNodeLabel } from '@/services/updateNodeLabel'
import { useCallback } from 'react'
import { useOnDeleteImage } from '@/hooks/useOnDeleteImage'

// TODO make into container component

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes, getEdges } = useReactFlow<
    ImageFlowData,
    ImageFlowEdgeData
  >()

  const content = data.content
  const showPreview = content?.showPreview
  const memo = content?.memo
  const image = data.content?.memo?.image
  const operationName = data.content?.operation?.name
  const operationArgs = data.content?.operationArgs
  const onNodeLabelChange = useCallback(
    (label: string) => updateNodeLabel(id, label, setNodes),
    [id, setNodes],
  )

  const onDownloadImage = useCallback(() => {
    if (!image) {
      console.warn('no image')
      return
    }

    downloadNodeImage(image, id)
  }, [id, image])

  const onDeleteImage = useOnDeleteImage(setNodes, getEdges, id)

  // TODO refactor this into a hook
  const onValueChange = (value: ImageFunctionParams) => {
    setNodes((prevNodes) =>
      prevNodes.map((node) => {
        if (node.id === id) {
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
  }

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="relative flex flex-col items-center justify-center gap-4 rounded border-2 border-gray-400 bg-white p-4 transition-all duration-300 ease-in-out hover:border-primary-600 dark:bg-slate-900">
        <span className="absolute left-0 top-0 pl-2 pt-2 text-xs font-semibold opacity-20">
          {id}
        </span>
        <Input type="text" value={data.label} onChange={onNodeLabelChange} />
        {/* TODO show UI for adjusting params */}
        {/* TODO issue rerender */}
        {operationName && operationArgs && (
          <NodeParamEditor
            operationName={operationName}
            value={operationArgs}
            onValueChange={onValueChange}
          />
        )}
        {showPreview && memo ? (
          <>
            <div className="relative s-64">
              <Image
                className="absolute left-0 top-0 h-full w-full object-contain"
                src={memo.thumbnail}
                alt=""
                layout="fill"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-gray-500">No flow yet</span>
            <GridLoader color="#217bad" />
          </div>
        )}
        <div className="flex items-center gap-2">
          {memo && memo.thumbnailDigest && (
            <>
              <span>{memo.thumbnailDigest}</span>
              <IconButton>
                <AiOutlineDownload
                  className="text-lg"
                  onClick={onDownloadImage}
                />
              </IconButton>
            </>
          )}
          <IconButton>
            <AiFillDelete className="text-lg" onClick={onDeleteImage} />
          </IconButton>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  )
}
