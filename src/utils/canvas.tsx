import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import React from 'react'

import is from '@sindresorhus/is'

import { confirmDialog, getLayerNameAndIcon } from '../components'

export const customKeys = [
  'createdBy',
  'modifiedBy',
  'createdTime',
  'modifiedTime',
  'shape',
]

export const getCanvasJson = (canvas: fabric.Canvas) => {
  if (!canvas) return null
  const canvasObject = canvas?.toObject([...customKeys, 'name'])
  if (is.emptyArray(canvasObject.objects)) return null
  return JSON.stringify(canvasObject)
}

export const updateActiveObjectsStyles = (
  canvas: fabric.Canvas | null,
  styles: IObjectOptions
) => {
  if (!canvas) return
  const selected = canvas.getActiveObjects()
  selected.map((object) => {
    if (object instanceof fabric.Textbox) {
      object.styles = {}
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

export const deleteActiveObjects = (canvas: fabric.Canvas) => {
  const activeObjects = canvas.getActiveObjects()

  if (activeObjects.length > 1) {
    confirmDialog({
      title: 'Delete selected layers?',
      body: (
        <ul style={{ maxHeight: '60vh', overflow: 'scroll' }}>
          {activeObjects.map((o, i) => {
            const { name } = getLayerNameAndIcon(o)
            return <li key={i}>{name}</li>
          })}
        </ul>
      ),
      isConfirmActionDangerous: true,
      onConfirm() {
        activeObjects.forEach((object) => canvas.remove(object))
        canvas.discardActiveObject()
      },
    })
  } else if (activeObjects[0]) {
    canvas.remove(activeObjects[0])
  }
}
