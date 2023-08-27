import 'reactflow/dist/style.css'
import 'react-tooltip/dist/react-tooltip.css'
import 'reactflow/dist/style.css'

import {
  ImageFlowData,
  ImageFlowEdgeData,
  ImageFlowNodeTypes,
} from '@/types/domain'
import ReactFlow, {
  Background,
  Connection,
  Controls,
  MiniMap,
  addEdge,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import { getMemolessInputNodes, getOutputNodes } from '@/services/nodeOps'
import { initialEdges, initialNodes } from '@/data/mock/imageFlow'
import { useCallback, useMemo } from 'react'
import useNodeCreationModal, {
  NodeCreationModalProvider,
} from '@/hooks/useNodeCreationModal'

import { CustomImageFlowNode } from '@/components/graph/customImageFlowNode'
import FlowToolbar from '@/components/menus/flowToolbar'
import { Inter } from 'next/font/google'
import { getImageUrlAsync } from '@/services/imageOps'
import { saveBlobToFile } from '@/services/saveFile'
import { useImageFlow } from '@/hooks/useImageFlow'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })

const imageFlowNodeTypes: ImageFlowNodeTypes = {
  imageFlowNode: CustomImageFlowNode,
}

export default function Home() {
  const nodeTypes = useMemo<ImageFlowNodeTypes>(() => imageFlowNodeTypes, [])
  const [nodes, setNodes, onNodesChange] =
    useNodesState<ImageFlowData>(initialNodes)
  const [edges, setEdges, onEdgesChange] =
    useEdgesState<ImageFlowEdgeData>(initialEdges)

  const nodeCreationModalProvider = useNodeCreationModal()
  // TODO use onnx runtime

  const downloadOutputImages = useCallback(() => {
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

  // TODO add button to restart flow from the input nodes

  // render the graph on start once
  useImageFlow(setEdges, setNodes, getMemolessInputNodes)

  const onConnect = useCallback(
    (params: Connection) => setEdges((e) => addEdge(params, e)),
    [setEdges],
  )

  return (
    <div className={inter.className}>
      <NodeCreationModalProvider value={nodeCreationModalProvider}>
        {/* TOOD Remove full padding around the whole thing */}
        <div className="flex flex-col justify-center gap-4 p-4">
          <div className="flex items-center justify-center">
            <span className="text-4xl font-light">Image Flow</span>
          </div>
          {/* TODO use panel as toolbar on mobile? */}
          <FlowToolbar downloadOutputImages={downloadOutputImages} />
          <div className="mt-0 border border-black dark:border-white">
            <div className="h-screen w-screen">
              <ReactFlow
                nodes={nodes}
                edges={edges}
                nodeTypes={nodeTypes}
                onNodesChange={onNodesChange}
                onEdgesChange={onEdgesChange}
                onConnect={onConnect}
              >
                <Controls />
                <MiniMap zoomable pannable />
                <Background gap={12} size={1} />
              </ReactFlow>
            </div>
          </div>
        </div>
      </NodeCreationModalProvider>
    </div>
  )
}
