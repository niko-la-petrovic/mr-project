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
import { useEffect, useMemo, useRef } from 'react'
import useNodeCreationModal, {
  NodeCreationModalProvider,
} from '@/hooks/useNodeCreationModal'

import AppTitle from '@/components/nonInteractive/appTitle'
import { CustomImageFlowNode } from '@/components/graph/customImageFlowNode'
import FlowToolbar from '@/components/menus/flowToolbar'
import { Inter } from 'next/font/google'
import NodeCreationModal from '@/components/menus/nodeCreationModal'
import { getMemolessInputNodes } from '@/services/nodeOps'
import redFragWGSL from '@/shaders/red.frag.wgsl'
import triangleVertWGSL from '@/shaders/triangle.vert.wgsl'
import useDownloadOutputImages from '@/hooks/useDownloadOutputImages'
import { useImageFlow } from '@/hooks/useImageFlow'
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

  const canvasRef = useRef<HTMLCanvasElement>(null)

  useEffect(() => {
    const gpuTest = async () => {
      const canvas = canvasRef.current
      if (!canvas) throw new Error('no canvas')

      console.group('webgpu')
      console.debug('canvas', canvas)

      const adapter = await navigator.gpu.requestAdapter()
      if (!adapter) throw new Error('no GPU adapter')

      console.debug('adapter', adapter)

      const device = await adapter.requestDevice()
      if (!device) throw new Error('no GPU device')

      console.debug('device', device)

      const context = canvas.getContext('webgpu')
      if (!context) throw new Error('no WebGPU context')

      console.debug('context', context)

      const devicePixelRatio = window.devicePixelRatio || 1
      // TODO check if necessary
      canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio)
      canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio)

      console.debug('devicePixelRatio', devicePixelRatio)

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat()

      console.debug('presentationFormat', presentationFormat)

      context.configure({
        device,
        format: presentationFormat,
        alphaMode: 'premultiplied',
      })

      const pipeline = device.createRenderPipeline({
        layout: 'auto',
        vertex: {
          module: device.createShaderModule({
            code: triangleVertWGSL,
          }),
          entryPoint: 'main',
        },
        fragment: {
          module: device.createShaderModule({
            code: redFragWGSL,
          }),
          entryPoint: 'main',
          targets: [
            {
              format: presentationFormat,
            },
          ],
        },
        primitive: {
          topology: 'triangle-list',
        },
      })

      function frame() {
        if (!context) throw new Error('no WebGPU context')

        const commandEncoder = device.createCommandEncoder()
        const textureView = context.getCurrentTexture().createView()

        const colorAttachment: GPURenderPassColorAttachment = {
          view: textureView,
          storeOp: 'store',
          loadOp: 'clear',
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        }

        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [colorAttachment],
        }

        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
        passEncoder.setPipeline(pipeline)
        passEncoder.draw(3, 1, 0, 0)
        passEncoder.end()

        device.queue.submit([commandEncoder.finish()])
        requestAnimationFrame(frame)
      }

      requestAnimationFrame(frame)
    }

    gpuTest()
  }, [])

  return (
    <div className={font.className}>
      <NodeCreationModalProvider value={nodeCreationModalProvider}>
        {/* TOOD Remove full padding around the whole thing */}
        <div className="flex flex-col justify-center gap-4 p-4">
          <AppTitle />
          <canvas ref={canvasRef} className="s-[1024px]" />
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
