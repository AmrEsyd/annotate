import { fabric } from 'fabric-pure-browser'
import clamp from 'lodash/clamp'

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

export const resetViewport = (
  canvas: fabric.Canvas | fabric.StaticCanvas | null
) => {
  const viewportTransform = canvas?.viewportTransform
  const original = canvas?.originalSize
  if (canvas && viewportTransform && original) {
    const zoom = canvas.getZoom()

    const currentWidthOffset = viewportTransform[4]
    const currentHeightOffset = viewportTransform[5]
    const maxWidthOffset = canvas.getWidth() - original.width * zoom
    const maxHeightOffset = canvas.getHeight() - original.height * zoom

    const widthOffset = clamp(currentWidthOffset, maxWidthOffset, 0)
    const heightOffset = clamp(currentHeightOffset, maxHeightOffset, 0)

    if (
      widthOffset !== currentWidthOffset ||
      heightOffset !== currentHeightOffset
    ) {
      canvas.setViewportTransform([
        ...viewportTransform.slice(0, 4),
        widthOffset,
        heightOffset,
      ])
    }
  }
}

type updateAndScaleImageValues = {
  canvas: fabric.Canvas | fabric.StaticCanvas | null
  image: fabric.Image | null
  zoom?: number
  zoomToPoint?: fabric.Point
} & (
  | { dimensions: { width: number; height: number } }
  | { container: HTMLElement }
)

export const updateAndScaleImage = (args: updateAndScaleImageValues) => {
  const { canvas, image, zoom, zoomToPoint } = args
  if (!canvas) return

  const containerDimensions =
    'container' in args
      ? {
          width: args.container.offsetWidth,
          height: args.container.offsetHeight,
        }
      : args.dimensions

  let size = { width: 1000, height: 600 }

  if (image) {
    canvas.backgroundImage = image

    size = calculateMaxSize(image.getOriginalSize(), MAX_CANVAS_WIDTH)

    image.scaleToWidth(size.width)
    image.scaleToHeight(size.height)
  }

  const zoomValue = zoom || 1

  const scale =
    Math.min(
      containerDimensions.width / size.width,
      containerDimensions.height / size.height
    ) * zoomValue

  canvas.setDimensions({
    height: Math.min(size.height * scale, containerDimensions.height),
    width: Math.min(size.width * scale, containerDimensions.width),
  })

  const canvasCenter = canvas.getCenter()
  canvas.zoomToPoint(
    zoomToPoint || new fabric.Point(canvasCenter.left, canvasCenter.top),
    scale
  )

  canvas.originalSize = size
  resetViewport(canvas)

  canvas.requestRenderAll()
}
