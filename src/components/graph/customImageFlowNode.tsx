import { AiFillDelete, AiOutlineDownload } from 'react-icons/ai'
import { Handle, Position, useReactFlow } from 'reactflow'
import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeProps,
} from '@/types/domain'

import { GridLoader } from 'react-spinners'
import { IconButton } from '../buttons/iconButton'
import Image from 'next/legacy/image'
import Input from '../inputs/input'
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

  return (
    <>
      <Handle type="target" position={Position.Top} />
      <div className="flex flex-col justify-center items-center p-4 bg-white dark:bg-slate-900 relative rounded gap-4 border-2 border-gray-400 hover:border-primary-600 transition-all duration-300 ease-in-out">
        <span className="absolute top-0 left-0 text-xs font-semibold pl-2 pt-2 opacity-20">
          {id}
        </span>
        <Input type="text" value={data.label} onChange={onNodeLabelChange} />
        {showPreview && memo ? (
          <>
            <div className="s-64 relative">
              <Image
                className="absolute top-0 left-0 w-full h-full object-contain"
                src={memo.thumbnail}
                alt=""
                layout="fill"
              />
            </div>
          </>
        ) : (
          <div className="flex flex-col gap-4 justify-center items-center">
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
