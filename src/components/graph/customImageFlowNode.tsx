import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNode,
  ImageFlowNodeProps,
} from '@/types/domain'
import Input, { InputChangeEvent } from '../inputs/input'
import { RefObject, useCallback, useRef } from 'react'

import { GridLoader } from 'react-spinners'
import { IconButton } from '../buttons/iconButton'
import Image from 'next/legacy/image'
import NodeParamEditor from '../nodeParams/nodeParamEditor'
import { downloadNodeImage } from '@/services/downloadNodeImage'
import { updateNodeLabel } from '@/services/updateNodeLabel'
import { useOnNodeArgsChanged } from '@/hooks/useOnNodeArgsChanged'
import { useOnNodeDeleteImage } from '@/hooks/useOnDeleteImage'
import useWebGPU from '@/hooks/useWebGPU'

// TODO make into container component

const unwrapNodeData = (node: ImageFlowNode) => {
  const data = node.data
  const content = data.content
  const showPreview = content?.showPreview
  const memo = content?.memo
  const image = data.content?.memo?.image
  const operationName = data.content?.operation?.name
  const operationArgs = data.content?.operationArgs
  const isWebGPU = data.content?.webGPUArgs !== undefined
  const webGpuArgs = data.content?.webGPUArgs
  return {
    data,
    content,
    showPreview,
    memo,
    image,
    operationName,
    operationArgs,
    isWebGPU,
    webGpuArgs,
  }
}

export function CustomImageFlowNode({ id, data }: ImageFlowNodeProps) {
  const { setNodes, getEdges, getNode, setEdges } = useReactFlow<
    ImageFlowData,
    ImageFlowEdgeData
  >()
  const node = getNode(id)
  if (!node) throw new Error('node not found')
  const {
    showPreview,
    memo,
    image,
    operationName,
    operationArgs,
    webGpuArgs,
    isWebGPU,
  } = unwrapNodeData(node)
  const showImage = showPreview && memo
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

  const onDeleteImage = useOnNodeDeleteImage(setNodes, setEdges, getEdges, id)
  const onArgsChanged = useOnNodeArgsChanged(setNodes, getEdges, node)

  const canvasRef: RefObject<HTMLCanvasElement> = useRef(null)
  useWebGPU(canvasRef, webGpuArgs)

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

        <div className={`relative s-64 ${showImage ? 'block' : 'hidden'}`}>
          {showImage && (
            <Image
              className="h-full w-full object-contain"
              src={memo.thumbnail}
              alt=""
              layout="fill"
            />
          )}
          <canvas
            ref={canvasRef}
            className={`absolute left-0 top-0 s-64 ${
              isWebGPU ? 'block' : 'hidden'
            }`}
          />
        </div>
        {!showImage && (
          <div className="flex flex-col items-center justify-center gap-4">
            <span className="text-gray-500">No flow yet</span>
            <GridLoader color="#217bad" />
          </div>
        )}

        <div className="flex items-center gap-2">
          {memo && memo.thumbnailDigest && (
            <>
              <span>{memo.thumbnailDigest}</span>
              <IconButton onClick={onDownloadImage}>
                <AiOutlineDownload className="text-lg" />
              </IconButton>
            </>
          )}
          <IconButton onClick={onDeleteImage}>
            <AiFillDelete className="text-lg" />
          </IconButton>
        </div>
      </div>
      <Handle type="source" position={Position.Bottom} id="a" />
    </>
  )
}
