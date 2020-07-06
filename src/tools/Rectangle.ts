import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'

import { CanvasTool } from './tool'

export class Rectangle extends CanvasTool {
  name = 'Rectangle'

  private isDown?: boolean
  private startX?: number
  private startY?: number
  private rect?: fabric.Rect

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
    let pointer = this.canvas.getPointer(event.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.rect = new fabric.Rect({
      ...this.props,
      left: this.startX,
      top: this.startY,
      originX: 'left',
      originY: 'top',
      width: pointer.x - this.startX,
      height: pointer.y - this.startY,
      rx: 10,
      ry: 10,
    })
    this.canvas.add(this.rect)
  }

  onMouseMove(event: fabric.IEvent) {
    if (!this.isDown || !this.startX || !this.startY || !this.rect) return
    let pointer = this.canvas.getPointer(event.e)
    if (this.startX > pointer.x) {
      this.rect.set({ left: Math.abs(pointer.x) })
    }
    if (this.startY > pointer.y) {
      this.rect.set({ top: Math.abs(pointer.y) })
    }
    this.rect.set({ width: Math.abs(this.startX - pointer.x) })
    this.rect.set({ height: Math.abs(this.startY - pointer.y) })
    this.rect.setCoords()
    this.canvas.requestRenderAll()
  }

  onMouseUp() {
    this.isDown = false
  }
}
