import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'

import { CanvasTool } from './tool'

export class Arrow extends CanvasTool {
  name = 'Arrow'

  private isDown = false
  private line?: fabric.Line
  private head?: fabric.Triangle

  configureCanvas(props: IObjectOptions) {
    this.canvas.isDrawingMode = this.canvas.selection = false
    this.canvas.defaultCursor = 'crosshair'
    this.canvas.forEachObject(
      (object) => (object.selectable = object.evented = false)
    )
    this.props = props
  }

  onMouseDown(event: fabric.IEvent) {
    this.isDown = true
    if (!this.props) return
    const { strokeDashArray, strokeDashOffset } = this.props

    const stroke = this.props.stroke || '#000000'
    const strokeWidth = this.props.strokeWidth || 8
    const pointer = this.canvas.getPointer(event.e)
    const points = [pointer.x, pointer.y, pointer.x, pointer.y]
    this.line = new fabric.Line(points, {
      strokeWidth: strokeWidth,
      fill: stroke,
      stroke: stroke,
      originX: 'center',
      originY: 'center',
      selectable: false,
      evented: false,
      strokeDashArray,
      strokeDashOffset,
    })

    this.head = new fabric.Triangle({
      fill: stroke,
      left: pointer.x,
      top: pointer.y,
      originX: 'center',
      originY: 'center',
      height: 3 * strokeWidth,
      width: 3 * strokeWidth,
      selectable: false,
      evented: false,
      angle: 90,
    })

    this.canvas.add(this.line, this.head)
  }

  onMouseMove(event: fabric.IEvent) {
    if (!this.isDown || !this.line || !this.head) return
    const pointer = this.canvas.getPointer(event.e)
    this.line.set({ x2: pointer.x, y2: pointer.y })
    this.line.setCoords()

    const x_delta = pointer.x - (this.line.x1 || 0)
    const y_delta = pointer.y - (this.line.y1 || 0)

    this.head.set({
      left: pointer.x,
      top: pointer.y,
      angle: 90 + (Math.atan2(y_delta, x_delta) * 180) / Math.PI,
    })

    this.canvas.requestRenderAll()
  }

  onMouseUp() {
    this.isDown = false

    if (!this.line || !this.head) return

    this.canvas.remove(this.line, this.head)
    const arrow = new fabric.Group([this.line, this.head], {
      shape: 'arrow',
    })
    this.canvas.add(arrow)
  }
}
