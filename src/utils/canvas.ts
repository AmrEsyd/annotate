import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'

export const customKeys = [
  'createdBy',
  'modifiedBy',
  'createdTime',
  'modifiedTime',
  'shape',
]

export const getCanvasJson = (canvas: fabric.Canvas) => {
  if (!canvas) return
  return JSON.stringify(canvas?.toObject([...customKeys, 'name']))
}

export const updateActiveObjectsStyles = (
  canvas: fabric.Canvas | null,
  styles: IObjectOptions
) => {
  if (!canvas) return
  const selected = canvas.getActiveObjects()
  selected.map((object) => {
    if (object instanceof fabric.Textbox) {
      object.setSelectionStyles(styles)
    } else if (object instanceof fabric.Group) {
      object.forEachObject((childObject) => {
        childObject.setOptions(styles)
      })
    }
    object.setOptions(styles)
    object.canvas?.fire('state:modified', { target: object })
  })
  canvas.requestRenderAll()
}
