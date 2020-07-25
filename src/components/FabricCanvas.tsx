import { fabric } from 'fabric-pure-browser'
import React, { ForwardRefRenderFunction } from 'react'
import isDeepEqual from 'react-fast-compare'

type CanvasProps = { canvasOptions?: fabric.ICanvasOptions }

const _Canvas: ForwardRefRenderFunction<fabric.Canvas, CanvasProps> = (
  props,
  ref
) => {
  const { canvasOptions } = props

  const updateCanvas = (CanvasElement: HTMLCanvasElement) => {
    const canvas = new fabric.Canvas(CanvasElement, {
      stopContextMenu: true,
      fireRightClick: true,
      hoverCursor: 'pointer',
      selectionBorderColor: '#009efe',
      selectionColor: 'rgb(226, 243, 255, 0.3)',
      ...canvasOptions,
    })

    if (typeof ref === 'function') {
      ref(canvas)
    } else if (ref) {
      ref.current = canvas
    }
  }

  return (
    <div style={{ border: 'solid 1px lightgray' }}>
      <canvas ref={updateCanvas} />
    </div>
  )
}

const _StaticCanvas: ForwardRefRenderFunction<
  fabric.StaticCanvas,
  CanvasProps
> = (props, ref) => {
  const { canvasOptions } = props

  const updateCanvas = (CanvasElement: HTMLCanvasElement) => {
    const canvas = new fabric.StaticCanvas(CanvasElement, {
      ...canvasOptions,
    })

    if (typeof ref === 'function') {
      ref(canvas)
    } else if (ref) {
      ref.current = canvas
    }
  }

  return (
    <div>
      <canvas ref={updateCanvas} />
    </div>
  )
}

export const FabricCanvas = React.memo(React.forwardRef(_Canvas), isDeepEqual)
export const FabricStaticCanvas = React.memo(
  React.forwardRef(_StaticCanvas),
  isDeepEqual
)

const rotateIcon =
  'data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMTkiIGhlaWdodD0iMjAiIHZpZXdCb3g9IjAgMCAzMiAzNCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTYuMjk3IDQuNHYtLjc0MWMwLS43NjguNDY0LTEuNDYyIDEuMjAzLTEuNzc2YTEuOTIyIDEuOTIyIDAgMDEyLjA2LjQzbDQuNTM3IDQuNTQ2YTEuOTEgMS45MSAwIDAxLjAwMiAyLjY5OGwtNC41NDkgNC41N2ExLjkyNiAxLjkyNiAwIDAxLTIuMDkuMzk2Yy0uNy0uMy0xLjE2My0uOTktMS4xNjMtMS43NTd2LTEuMTdhNy4yMzMgNy4yMzMgMCAwMC0uMTY0LS4wMDFjLTMuNzgzIDAtNi44NjMgMy4wOC02Ljg2MyA2Ljg2MSAwIDMuNzgxIDMuMDgyIDYuODYzIDYuODYzIDYuODYzIDMuNzggMCA2Ljg2MS0zLjA4MiA2Ljg2MS02Ljg2MyAwLTEuMDU0Ljg1Ni0xLjkxIDEuOTEyLTEuOTFoMy4zNjljMS4wNTQgMCAxLjkxMi44NTYgMS45MTIgMS45MSAwIDcuNzUtNi4zMDcgMTQuMDU5LTE0LjA1NCAxNC4wNTktNy43NSAwLTE0LjA1NS02LjMwOC0xNC4wNTUtMTQuMDU5IDAtNy43NTEgNi4zMDQtMTQuMDU3IDE0LjA1NS0xNC4wNTdsLjE2NC4wMDF6IiBmaWxsPSIjMDAwIiBmaWxsLXJ1bGU9Im5vbnplcm8iIHN0cm9rZT0iI0ZGRiIgc3Ryb2tlLXdpZHRoPSIyLjUiLz48L3N2Zz4='

fabric.Object.prototype.cornerSize = 6
fabric.Object.prototype.borderScaleFactor = 1.5
fabric.Object.prototype.cornerColor = 'rgb(255, 255, 255)'
fabric.Object.prototype.cornerStrokeColor = 'rgb(53, 167, 242,0.9)'
fabric.Object.prototype.borderColor = 'rgb(53, 167, 242,0.9)'
fabric.Object.prototype.transparentCorners = false
fabric.Object.prototype.strokeUniform = true
//@ts-expect-error
const objectControls = fabric.Object.prototype.controls
objectControls.mtr.offsetY = -15
objectControls.mtr.cursorStyleHandler = () =>
  `url("${rotateIcon}") 10 10, crosshair`
objectControls.mr.visible = false
objectControls.ml.visible = false
objectControls.mb.visible = false
objectControls.mt.visible = false
