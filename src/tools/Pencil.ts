import { IObjectOptions } from 'fabric/fabric-impl'

import is from '@sindresorhus/is'

import { CanvasTool } from './tool'

export class Pencil extends CanvasTool {
  name = 'Pencil'

  onMouseDown: undefined
  onMouseMove: undefined
  onMouseUp: undefined

  configureCanvas(props: IObjectOptions) {
    const { stroke, strokeWidth = 4, fill } = props
    this.canvas.isDrawingMode = true
    this.canvas.freeDrawingBrush.width = strokeWidth
    this.canvas.freeDrawingBrush.color =
      stroke || (is.string(fill) ? fill : 'white')
    //@ts-ignore
    this.canvas.freeDrawingBrush.decimate = 5
  }
}
