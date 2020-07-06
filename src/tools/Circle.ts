import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'

import { CanvasTool } from './tool'

export class Circle extends CanvasTool {
  name = 'Circle'

  private isDown?: boolean
  private startX?: number
  private startY?: number
  private ellipse?: fabric.Ellipse

  configureCanvas(props: IObjectOptions) {
    this.canvas.isDrawingMode = this.canvas.selection = false
    this.canvas.defaultCursor = 'crosshair'
    this.canvas.forEachObject(
      (object) => (object.selectable = object.evented = false)
    )
    this.props = props
  }

  onMouseDown(o: fabric.IEvent) {
    this.isDown = true
    let pointer = this.canvas.getPointer(o.e)
    this.startX = pointer.x
    this.startY = pointer.y
    this.ellipse = new fabric.Ellipse({
      ...this.props,
      left: this.startX,
      top: this.startY,
      originX: 'left',
      originY: 'center',
      rx: 1,
      ry: 1,
    })
    this.canvas.add(this.ellipse)
  }

  onMouseMove(o: fabric.IEvent) {
    if (!this.isDown || !this.ellipse || !this.startY || !this.startX) return
    const pointer = this.canvas.getPointer(o.e)

    this.ellipse.set({
      rx: Math.abs(this.startX - pointer.x) / 2,
      ry: Math.abs(this.startY - pointer.y) / 2,
      originX: this.startX > pointer.x ? 'right' : 'left',
      originY: this.startY > pointer.y ? 'bottom' : 'top',
    })
    this.ellipse.setCoords()

    this.canvas.requestRenderAll()
  }

  onMouseUp() {
    this.isDown = false
  }
}
