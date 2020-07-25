import { fabric } from 'fabric-pure-browser'
import React, { useEffect } from 'react'
import { useDebouncedCallback } from 'use-debounce'

import { Loader, useSession } from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { FabricCanvas, shortcutsList } from './components/'
import { useHotkeys, useImage, useResize } from './hooks'
import { CanvasTool } from './tools'
import { getCanvasJson, updateAndScaleImage } from './utils'

type DrawCanvasProps = {
  drawLayerJson?: string
  onDraw?: (newDrawLayerJson: string) => void
  imageUrl: string
  onSelection: (e: fabric.IEvent) => unknown
  activeTool: CanvasTool | null
  handleToolChange: (newTool: CanvasTool | null) => void
  canvas: fabric.Canvas | null
  setCanvas: React.Dispatch<React.SetStateAction<fabric.Canvas | null>>
}

export const DrawCanvas: React.FC<DrawCanvasProps> = (props) => {
  const {
    imageUrl,
    drawLayerJson: syncedStorage,
    onDraw: updateSyncedStorage,
    onSelection,
    activeTool,
    handleToolChange,
    canvas,
    setCanvas,
  } = props

  const [image] = useImage(imageUrl)
  const session = useSession()

  useEffect(() => updateAndScaleImage(canvas, image), [image, canvas])
  useResize(() => updateAndScaleImage(canvas, image), [image, canvas])

  const deleteActiveObjects = (event: KeyboardEvent) => {
    //@ts-ignore
    const targetType = event?.target?.type as string | undefined
    if (targetType !== 'text' && targetType !== 'textarea') {
      canvas?.getActiveObjects()?.forEach((object) => canvas.fxRemove(object))
      canvas?.discardActiveObject()
    }
  }

  useHotkeys(shortcutsList.deleteShape.shortcuts.join(), deleteActiveObjects, [
    canvas,
  ])

  useEffect(() => {
    if (!canvas) return
    const currentCanvasValue = getCanvasJson(canvas)
    if (syncedStorage && syncedStorage !== currentCanvasValue) {
      canvas.loadFromJSON(syncedStorage, () => {
        canvas.backgroundImage = image || undefined
        canvas.requestRenderAll()
      })
    }
  }, [canvas, syncedStorage, image])

  const [saveToAirtable] = useDebouncedCallback(() => {
    if (!canvas) return
    const newStorageValue = getCanvasJson(canvas)
    if (
      updateSyncedStorage &&
      is.string(newStorageValue) &&
      newStorageValue !== syncedStorage
    ) {
      updateSyncedStorage(newStorageValue)
    }
  }, 200)

  useEffect(() => {
    if (!canvas) return

    const events = {
      'after:render': saveToAirtable,
      'mouse:up': (e: fabric.IEvent) => {
        activeTool?.onMouseUp?.(e)
        handleToolChange(null)
      },
      'mouse:move': (e: fabric.IEvent) => activeTool?.onMouseMove?.(e),
      'selection:created': (e: fabric.IEvent) => onSelection(e),
      'selection:updated': (e: fabric.IEvent) => onSelection(e),
      'selection:cleared': (e: fabric.IEvent) => onSelection(e),
      'mouse:down': (event: fabric.IEvent) => {
        if (event.button === 1 /* left click */) {
          const noActiveObjects = canvas.getActiveObjects().length === 0
          if (!event.target && noActiveObjects) {
            activeTool?.onMouseDown?.(event)
          }
        }
      },
      'object:added': (event: fabric.IEvent) => {
        const object = event.target
        if (object && !object.createdTime && !object.createdBy) {
          object.createdBy = session.currentUser?.id
          object.modifiedBy = session.currentUser?.id
          object.createdTime = Date.now()
          object.modifiedTime = Date.now()
        }
      },
      'state:modified': (event: fabric.IEvent) => {
        const object = event.target
        if (object) {
          object.modifiedBy = session.currentUser?.id
          object.modifiedTime = Date.now()
        }
        saveToAirtable()
      },
      'object:modified': (event: fabric.IEvent) => {
        const object = event.target
        if (object) {
          object.modifiedBy = session.currentUser?.id
          object.modifiedTime = Date.now()
        }
      },
    }

    canvas.on(events)
    return () => {
      Object.entries(events).forEach(([event, func]) => {
        canvas.off(event, func)
      })
    }
  }, [
    activeTool,
    canvas,
    saveToAirtable,
    onSelection,
    handleToolChange,
    session.currentUser?.id,
  ])

  return !imageUrl || image ? (
    <FabricCanvas ref={setCanvas} />
  ) : (
    <Loader flex="1" />
  )
}
