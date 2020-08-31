import { fabric } from 'fabric-pure-browser'

import { resetViewport } from '../utils'
import { CanvasTool } from './tool'

export class Move extends CanvasTool {
  name = 'Move'

  private isDown?: boolean
  private startX?: number
  private startY?: number

  configureCanvas() {
    this.canvas.isDrawingMode = false
    this.canvas.selection = false
    this.canvas.forEachObject((o) => (o.selectable = o.evented = false))
    this.canvas.defaultCursor = 'move'
  }

  onMouseDown(event: fabric.IEvent) {
    this.isDown = true
    const pointer = this.canvas.getPointer(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
  }

  onMouseMove(event: fabric.IEvent) {
    if (!this.isDown || !this.startX || !this.startY) return
    const pointer = this.canvas.getPointer(event.e)

    const point = new fabric.Point(
      pointer.x - this.startX,
      pointer.y - this.startY
    )

    this.canvas.relativePan(point)
    resetViewport(this.canvas)

    this.canvas.requestRenderAll()
  }

  onMouseUp() {
    this.isDown = false
  }
}
