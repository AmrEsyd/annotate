import { fabric } from 'fabric-pure-browser'
import clamp from 'lodash/clamp'
import throttle from 'lodash/throttle'
import React, { useCallback, useContext, useEffect, useRef } from 'react'
import { FiZoomIn, FiZoomOut } from 'react-icons/fi'
import { useDebouncedCallback } from 'use-debounce'

import { Box, Loader, useSession } from '@airtable/blocks/ui'

import { FabricCanvas, IconButton, shortcutsList } from './components/'
import { EditorContext } from './Editor'
import { useHotkeys, useImage, useResize } from './hooks'
import { Move, Select } from './tools'
import {
  deleteActiveObjects,
  getCanvasJson,
  resetViewport,
  updateAndScaleImage,
} from './utils'

const MAX_ZOOM = 10
const MIN_ZOOM = 0.98

type DrawCanvasProps = {
  store?: string
  updateStore?: (newDrawLayerJson: string | null) => void
  imageUrl: string
  onSelection: (e: fabric.IEvent) => unknown
}

export const DrawCanvas: React.FC<DrawCanvasProps> = (props) => {
  const { imageUrl, store, updateStore, onSelection } = props

  const {
    canvas,
    setCanvas,
    activeTool,
    canvasContainerRef,
    handleToolChange,
  } = useContext(EditorContext)

  const [image] = useImage(imageUrl)
  const session = useSession()
  const zoomRef = useRef(MIN_ZOOM)

  const setZoom = useCallback(
    (value: number, zoomToPoint?: fabric.Point) => {
      const container = canvasContainerRef.current
      const zoom = clamp(zoomRef.current + value, MIN_ZOOM, MAX_ZOOM)
      zoomRef.current = zoom
      if (container)
        updateAndScaleImage({ canvas, image, container, zoom, zoomToPoint })
    },
    [canvas, image, canvasContainerRef]
  )

  const updateImage = () => {
    const container = canvasContainerRef.current
    if (container)
      updateAndScaleImage({ canvas, image, container, zoom: zoomRef.current })
  }

  useEffect(updateImage, [image, canvas, canvasContainerRef])
  useResize(updateImage, [image, canvas, canvasContainerRef])

  useHotkeys(
    shortcutsList.deleteShape.shortcuts,
    () => canvas && deleteActiveObjects(canvas),
    [canvas]
  )

  useEffect(() => {
    if (!canvas) return
    const currentCanvasValue = getCanvasJson(canvas)
    if (store && store !== currentCanvasValue) {
      canvas.loadFromJSON(store, () => {
        canvas.backgroundImage = image || undefined
        canvas.requestRenderAll()
      })
    }
  }, [canvas, store, image])

  const [saveToAirtable] = useDebouncedCallback(() => {
    if (!canvas) return
    const newStorageValue = getCanvasJson(canvas)
    if (updateStore && newStorageValue !== store) {
      updateStore(newStorageValue)
    }
  }, 200)

  useEffect(() => {
    if (!canvas) return
    const isCursor = activeTool instanceof Move || activeTool instanceof Select

    const handleWheel = throttle(
      (event: WheelEvent, pointer?: fabric.Point) => {
        // ctrlKey is for "Pinch to zoom" using trackpad
        if (event.metaKey || event.ctrlKey) {
          setZoom(-event.deltaY / 15, pointer)
        } else {
          canvas.relativePan(
            new fabric.Point(event.deltaX * -2, event.deltaY * -2)
          )
          resetViewport(canvas)
        }
      },
      30
    )

    const handleContainerWheel = (event: WheelEvent) => {
      event.preventDefault()
      event.stopPropagation()
      handleWheel(event)
    }

    const containerElement = canvasContainerRef.current
    containerElement?.addEventListener('wheel', handleContainerWheel)

    const events = {
      'after:render': saveToAirtable,
      'mouse:up': (e: fabric.IEvent) => {
        activeTool?.onMouseUp?.(e)
        if (!isCursor) {
          handleToolChange(null)
        }
      },
      'mouse:wheel': (event: fabric.IEvent) => {
        const wheelEvent = event.e as WheelEvent
        wheelEvent.preventDefault()
        wheelEvent.stopPropagation()
        handleWheel(wheelEvent, event.pointer)
      },
      'mouse:move': throttle((event: fabric.IEvent) => {
        activeTool?.onMouseMove?.(event)
      }, 30),
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
      containerElement?.removeEventListener('wheel', handleContainerWheel)
    }
  }, [
    canvasContainerRef,
    setZoom,
    activeTool,
    canvas,
    saveToAirtable,
    onSelection,
    handleToolChange,
    session.currentUser?.id,
  ])

  return imageUrl && !image ? (
    <Loader flex="1" />
  ) : (
    <Box backgroundColor="white">
      <FabricCanvas ref={setCanvas} />
      <Box
        position="fixed"
        alignItems="center"
        right={2}
        bottom={2}
        backgroundColor="dark"
        paddingX={1}
        borderRadius={3}
        opacity={0.85}
      >
        <IconButton
          hideLabel
          style={{ color: 'white' }}
          label="Zoom In"
          icon={<FiZoomIn strokeWidth="3" />}
          onClick={() => {
            setZoom(+0.1)
          }}
        />
        <IconButton
          hideLabel
          style={{ color: 'white' }}
          label="Zoom Out"
          icon={<FiZoomOut strokeWidth="3" />}
          onClick={() => {
            setZoom(-0.1)
          }}
        />
      </Box>
    </Box>
  )
}
