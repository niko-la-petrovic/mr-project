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
  Controls,
  MiniMap,
  useEdgesState,
  useNodesState,
} from 'reactflow'
import { initialEdges, initialNodes } from '@/data/mock/imageFlow'
import useNodeCreationModal, {
  NodeCreationModalProvider,
} from '@/hooks/useNodeCreationModal'

import AppTitle from '@/components/nonInteractive/appTitle'
import { CustomImageFlowNode } from '@/components/graph/customImageFlowNode'
import FlowToolbar from '@/components/menus/flowToolbar'
import { Inter } from 'next/font/google'
import NodeCreationModal from '@/components/menus/nodeCreationModal'
import { getMemolessInputNodes } from '@/services/nodeOps'
import useDownloadOutputImages from '@/hooks/useDownloadOutputImages'
import { useImageFlow } from '@/hooks/useImageFlow'
import { useMemo } from 'react'
import useOnConnect from '@/hooks/useOnConnect'

export const font = Inter({ subsets: ['latin'], variable: '--font-inter' })

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

  const downloadOutputImages = useDownloadOutputImages(edges, nodes)

  // TODO add button to restart flow from the input nodes

  // render the graph on start once
  useImageFlow(setEdges, setNodes, getMemolessInputNodes)

  const onConnect = useOnConnect(nodes, setNodes, setEdges)

  return (
    <div className={font.className}>
      <NodeCreationModalProvider value={nodeCreationModalProvider}>
        {/* TOOD Remove full padding around the whole thing */}
        <div className="flex flex-col justify-center gap-4 p-4">
          <AppTitle />
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
        <NodeCreationModal setNodes={setNodes} />
      </NodeCreationModalProvider>
    </div>
  )
}
