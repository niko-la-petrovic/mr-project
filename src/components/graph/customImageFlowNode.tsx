import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeProps,
} from '@/types/domain'
import Input, { InputChangeEvent } from '../inputs/input'

import { GridLoader } from 'react-spinners'
import { IconButton } from '../buttons/iconButton'
import Image from 'next/legacy/image'
import NodeParamEditor from '../nodeParams/nodeParamEditor'
import { downloadNodeImage } from '@/services/downloadNodeImage'
import { updateNodeLabel } from '@/services/updateNodeLabel'
import { useCallback } from 'react'
import { useOnNodeArgsChanged } from '@/hooks/useOnNodeArgsChanged'
import { useOnNodeDeleteImage } from '@/hooks/useOnDeleteImage'

// TODO make into container component

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes, getEdges, getNode } = useReactFlow<
    ImageFlowData,
    ImageFlowEdgeData
  >()
  const node = getNode(id)
  if (!node) throw new Error('node not found')
  const content = data.content
  const showPreview = content?.showPreview
  const memo = content?.memo
  const image = data.content?.memo?.image
  const operationName = data.content?.operation?.name
  const operationArgs = data.content?.operationArgs
  const onNodeLabelChange = useCallback(
    (e: InputChangeEvent) => updateNodeLabel(id, e.target.value, setNodes),
    [id, setNodes],
  )

  const onDownloadImage = useCallback(() => {
    if (!image) {
      console.warn('no image')
      return
    }

    downloadNodeImage(image, id)
  }, [id, image])

  const onDeleteImage = useOnNodeDeleteImage(setNodes, getEdges, id)

  const onArgsChanged = useOnNodeArgsChanged(setNodes, getEdges, node)

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="relative flex flex-col items-center justify-center gap-4 rounded border-2 border-gray-400 bg-white p-4 transition-all duration-300 ease-in-out hover:border-primary-600 dark:bg-slate-900">
        <span className="absolute left-0 top-0 pl-2 pt-2 text-xs font-semibold opacity-20">
          {id}
        </span>
        <Input type="text" value={data.label} onChange={onNodeLabelChange} />
        {operationName && operationArgs && (
          <NodeParamEditor
            operationName={operationName}
            value={operationArgs}
            onValueChange={onArgsChanged}
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
