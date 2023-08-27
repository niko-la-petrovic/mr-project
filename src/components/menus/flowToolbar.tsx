import {
  AiOutlineDelete,
  AiOutlineDownload,
  AiOutlinePlaySquare,
  AiOutlinePlusSquare,
} from 'react-icons/ai'

import { IconButton } from '../buttons/iconButton'
import { NodeCreationModalContext } from '@/hooks/useNodeCreationModal'
import { useContext } from 'react'

const toolbarIconClass = 'text-2xl'

export interface FlowToolbarProps {
  downloadOutputImages: () => void
}

export default function FlowToolbar({
  downloadOutputImages,
}: FlowToolbarProps) {
  const { openModal } = useContext(NodeCreationModalContext)
  return (
    <div className="z-10 flex justify-start gap-1 drop-shadow-lg">
      {/* TODO add shortcut descriptors to each of these */}
      <IconButton tooltip={{ id: 'add', content: 'Add' }} onClick={openModal}>
        <AiOutlinePlusSquare className={toolbarIconClass} />
      </IconButton>
      <IconButton tooltip={{ id: 'add', content: 'Remove' }}>
        <AiOutlineDelete className={toolbarIconClass} />
      </IconButton>
      <IconButton tooltip={{ id: 'add', content: 'Run' }}>
        <AiOutlinePlaySquare className={toolbarIconClass} />
      </IconButton>
      <IconButton
        tooltip={{ id: 'add', content: 'Save' }}
        onClick={downloadOutputImages}
      >
        <AiOutlineDownload className={toolbarIconClass} />
      </IconButton>
    </div>
  )
}
