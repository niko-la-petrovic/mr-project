import { RefObject, useEffect } from 'react'

import { WebGPUArgs } from '@/types/domain'

export default function useWebGPU(
  canvasRef: RefObject<HTMLCanvasElement>,
  webGPUArgs: WebGPUArgs | undefined,
) {
  useEffect(() => {
    if (!webGPUArgs) return

    const gpuTest = async () => {
      const canvas = canvasRef.current
      console.log('canvas', canvas)
      if (!canvas) return

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

      const pipeline = device.createRenderPipeline(
        webGPUArgs.operation.pipelineDescriptorGenerator(
          presentationFormat,
          device,
        ),
      )

      function frame() {
        if (!context) throw new Error('no WebGPU context')

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

        const commandEncoder = device.createCommandEncoder()
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
  }, [canvasRef, webGPUArgs])
}
