import { RefObject, useEffect } from 'react'

import { WebGPUArgs } from '@/types/domain'

export default function useWebGPU(
  canvasRef: RefObject<HTMLCanvasElement>,
  webGPUArgs: WebGPUArgs | undefined,
) {
  useEffect(() => {
    if (!webGPUArgs) return
    const operation = webGPUArgs.operation

    const gpuTest = async () => {
      // TODO refactor this initialization/param mapping code
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

      const canvasContext = canvas.getContext('webgpu')
      if (!canvasContext) throw new Error('no WebGPU context')
      console.debug('context', canvasContext)

      const devicePixelRatio = window.devicePixelRatio || 1
      canvas.width = Math.floor(canvas.clientWidth * devicePixelRatio)
      canvas.height = Math.floor(canvas.clientHeight * devicePixelRatio)
      console.debug('devicePixelRatio', devicePixelRatio)

      const presentationFormat = navigator.gpu.getPreferredCanvasFormat()
      console.debug('presentationFormat', presentationFormat)

      canvasContext.configure({
        device,
        format: presentationFormat,
        alphaMode: 'premultiplied',
      })

      // prepare render pipeline
      const pipeline = device.createRenderPipeline(
        operation.pipelineDescriptorGenerator(presentationFormat, device),
      )

      // initialize buffers used for bind groups
      const bufferMap =
        operation.bufferGenerator && operation.bufferGenerator(device)

      // initialize bind group descriptors
      const bindGroupDescriptors =
        bufferMap &&
        operation.bindGroupDescriptorGenerator &&
        operation.bindGroupDescriptorGenerator(pipeline, bufferMap)

      // initialize bind groups
      const bindGroupMap =
        bufferMap &&
        bindGroupDescriptors &&
        operation.bindGroupInitializer &&
        operation.bindGroupInitializer(device, bufferMap, bindGroupDescriptors)

      // TODO use
      // let frameCount = 0
      // let startTime = Date.now()
      function frame() {
        if (!canvasContext) throw new Error('no WebGPU canvas context')
        const now = performance.now()

        // update buffers
        operation?.bindResourcesPreUpdate &&
          operation.bindResourcesPreUpdate({
            device,
            bufferMap,
            now: now,
          })

        // prepare canvas for re-render
        const textureView = canvasContext.getCurrentTexture().createView()
        const colorAttachment: GPURenderPassColorAttachment = {
          view: textureView,
          storeOp: 'store',
          loadOp: 'clear',
          clearValue: { r: 0.0, g: 0.0, b: 0.0, a: 1.0 },
        }
        const renderPassDescriptor: GPURenderPassDescriptor = {
          colorAttachments: [colorAttachment],
        }

        // prepare command encoder
        const commandEncoder = device.createCommandEncoder()
        // prepare render pass encoder
        const passEncoder = commandEncoder.beginRenderPass(renderPassDescriptor)
        // set up render pipeline
        passEncoder.setPipeline(pipeline)
        bindGroupMap?.forEach((bindGroups, groupIndex) => {
          bindGroups.forEach((bindGroup) =>
            passEncoder.setBindGroup(groupIndex, bindGroup),
          )
        })
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
