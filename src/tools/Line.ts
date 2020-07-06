import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'

import { CanvasTool } from './tool'

export class Line extends CanvasTool {
  name = 'Line'

  private isDown?: boolean
  private line?: fabric.Line

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
    const pointer = this.canvas.getPointer(event.e)
    const points = [pointer.x, pointer.y, pointer.x, pointer.y]
    this.line = new fabric.Line(points, {
      ...this.props,
      originX: 'center',
      originY: 'center',
    })
    this.canvas.add(this.line)
  }

  onMouseMove(event: fabric.IEvent) {
    if (!this.isDown) return
    const pointer = this.canvas.getPointer(event.e)
    this.line?.set({ x2: pointer.x, y2: pointer.y })
    this.line?.setCoords()
    this.canvas.renderAll()
  }

  onMouseUp() {
    this.isDown = false
  }
}
