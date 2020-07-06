import { CanvasTool } from './tool'

export class Select extends CanvasTool {
  name = 'Select'

  onMouseDown: undefined
  onMouseMove: undefined
  onMouseUp: undefined

  configureCanvas() {
    this.canvas.isDrawingMode = false
    this.canvas.selection = true
    this.canvas.defaultCursor = 'default'
    this.canvas.forEachObject((object) => {
      object.selectable = object.evented = true
    })
  }
}
