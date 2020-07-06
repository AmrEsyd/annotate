import { fabric } from 'fabric-pure-browser'

export const MAX_CANVAS_WIDTH = 1000

export const downloadCanvasAsImage = (
  canvas: fabric.Canvas,
  name: string = 'image'
) => {
  const image = canvas.backgroundImage

  let size = { width: 1000, height: 600 }

  if (image instanceof fabric.Image) {
    size = image.getOriginalSize()
  }

  const scale = size.width / canvas.getWidth() / 2

  const dataUrl = canvas.toDataURL({
    enableRetinaScaling: true,
    withoutTransform: true,
    multiplier: scale,
  })

  const link = document.createElement('a')
  link.download = name + '.png'
  link.href = dataUrl
  link.click()
}

export const calculateMaxSize = (
  image: { width: number; height: number },
  maxSize: number
): { width: number; height: number } => {
  const largest = Math.max(image.width, image.height)
  if (largest < maxSize) return { width: image.width, height: image.height }
  const scale = maxSize / largest
  return {
    width: image.width * scale,
    height: image.height * scale,
  }
}

export const updateAndScaleImage = (
  canvas: fabric.Canvas | null,
  image: fabric.Image | null
) => {
  if (!canvas) return

  const container = document.querySelector<HTMLElement>('#canvasContainer')

  if (!container) return

  updateAndScaleImageBySize(canvas, image, {
    width: container.offsetWidth,
    height: container.offsetHeight,
  })
}

export const updateAndScaleImageBySize = (
  canvas: fabric.Canvas | fabric.StaticCanvas | null,
  image: fabric.Image | null,
  canvasContainerDimensions: {
    width: number
    height: number
  }
) => {
  if (!canvas) return

  let size = { width: 1000, height: 600 }

  if (image) {
    canvas.backgroundImage = image

    size = calculateMaxSize(image.getOriginalSize(), MAX_CANVAS_WIDTH)

    image.scaleToWidth(size.width)
    image.scaleToHeight(size.height)
  }

  const scale = Math.min(
    canvasContainerDimensions.width / size.width,
    canvasContainerDimensions.height / size.height
  )

  canvas.setDimensions({
    height: size.height * scale,
    width: size.width * scale,
  })

  canvas.setZoom(scale)

  canvas.requestRenderAll()
}
