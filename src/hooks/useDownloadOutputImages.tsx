import { ImageFlowEdge, ImageFlowNode } from '@/types/domain'

import { getImageUrlAsync } from '@/services/imageOps'
import { getOutputNodes } from '@/services/nodeOps'
import { saveBlobToFile } from '@/services/saveFile'
import { useCallback } from 'react'

export default function useDownloadOutputImages(
  edges: ImageFlowEdge[],
  nodes: ImageFlowNode[],
) {
  return useCallback(() => {
    getOutputNodes(edges, nodes).forEach((n) => {
      n?.data?.content?.memo?.image &&
        getImageUrlAsync(n.data.content.memo.image).then((url) =>
          fetch(url)
            .then((response) => response.blob())
            .then((blob) => {
              saveBlobToFile([blob], 'image/png', `${n.id}.png`)
            }),
        )
    })
  }, [edges, nodes])
}
