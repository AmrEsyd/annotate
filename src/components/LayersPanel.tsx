import { fabric } from 'fabric-pure-browser'
import GraphemeSplitter from 'grapheme-splitter'
import debounce from 'lodash/debounce'
import React, { useContext, useEffect, useRef, useState } from 'react'
import isDeepEqual from 'react-fast-compare'
import { FiType } from 'react-icons/fi'

import { Box, Icon } from '@airtable/blocks/ui'
import styled from '@emotion/styled'
import is from '@sindresorhus/is'

import { ContextMenuEvent } from '../components'
import { EditorContext } from '../Editor'
import { shapesList } from '../tools'

const splitter = new GraphemeSplitter()

type objectListType = {
  [objectType: string]: { icon: React.ReactNode; label: string } | undefined
}

const objectList: objectListType = {
  rect: shapesList.Rectangle,
  ellipse: shapesList.Circle,
  path: shapesList.Pencil,
  textbox: { label: 'Text', icon: <FiType /> },
  group: shapesList.Arrow,
}

const LayerContainer = styled.div<{ isSelected?: boolean }>`
  display: flex;
  align-items: center;
  margin: 0.1rem 0;
  padding: 0.4rem 0.6rem;
  background: ${({ isSelected }) =>
    isSelected ? 'rgba(0, 0, 0, 0.05)' : 'none'};

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const Input = styled.input`
  background: none;
  border: none;
  flex: 1;
  margin: 0 0.5rem;
  color: hsl(0, 0%, 20%);
  width: 100%;

  &:focus,
  :active {
    outline: none;
    border: 2px solid rgba(0, 0, 0, 0.25);
  }
`

export const getLayerNameAndIcon = (object: fabric.Object) => {
  const type = object.type
  const conf = type ? objectList[type] : null
  if (object instanceof fabric.Textbox) {
    const isSingleCharacter =
      object.text && splitter.countGraphemes(object.text) === 1

    if (isSingleCharacter) {
      return {
        name: object.name || 'Emoji',
        icon: object.text,
      }
    }
  }
  return {
    name: object.name || (object as fabric.Textbox).text || conf?.label || type,
    icon: conf?.icon || <Icon name="shapes" size={13} />,
  }
}

type layerProps = {
  object: fabric.Object
  isSelected?: boolean
  setContextMenu: (menuEvent: ContextMenuEvent | null) => unknown
  canvas: fabric.Canvas
}

const _Layer: React.FC<layerProps> = (props) => {
  const { object, canvas, isSelected, setContextMenu } = props
  const inputRef = useRef<HTMLInputElement>(null)
  const { name, icon } = getLayerNameAndIcon(object)

  const [isRenaming, setIsRenaming] = useState(false)
  const [value, setValue] = useState<string | undefined>(name)

  const save = () => {
    if (value !== name) {
      object.set('name', value)
      object.canvas?.fire('state:modified', { target: object })
    }
    setIsRenaming(false)
  }

  const selectLayer = () => {
    let selectedObjects = canvas?.getActiveObjects()
    canvas.discardActiveObject()

    if (selectedObjects?.includes(object)) {
      selectedObjects = selectedObjects.filter(
        (selectedObject) => selectedObject !== object
      )
    } else {
      selectedObjects = selectedObjects
        ? [...selectedObjects, object]
        : [object]
    }

    if (is.nonEmptyArray(selectedObjects)) {
      const selection = new fabric.ActiveSelection(selectedObjects, {
        canvas: canvas,
      })
      canvas.setActiveObject(selection)
    }

    canvas.requestRenderAll()
  }

  return (
    <LayerContainer
      isSelected={isSelected}
      onContextMenu={(e) => {
        e.preventDefault()
        setContextMenu({ position: { x: e.clientX, y: e.clientY }, object })
      }}
      onClick={selectLayer}
      onDoubleClick={() => {
        setIsRenaming(true)
      }}
    >
      {icon}
      {isRenaming ? (
        <Input
          ref={inputRef}
          autoFocus
          value={value || ''}
          onChange={(e: React.ChangeEvent<HTMLInputElement>) => {
            setValue(e.target.value)
          }}
          onBlur={save}
          onKeyDown={(event) => {
            if (event.key === 'Enter') {
              save()
            }
          }}
        />
      ) : (
        <Box
          flex={1}
          margin="0 .5rem"
          overflow="hidden"
          style={{ whiteSpace: 'nowrap', textOverflow: 'ellipsis' }}
        >
          {value}
        </Box>
      )}
    </LayerContainer>
  )
}

const Layer = React.memo(_Layer, isDeepEqual)

export const LayersPanel: React.FC = () => {
  const { setContextMenu, canvas } = useContext(EditorContext)
  const [objects, setObjects] = useState(canvas?.getObjects())

  useEffect(() => {
    if (!canvas) return

    const updateObjects = debounce(() => {
      setObjects(canvas?.getObjects())
    }, 50)

    updateObjects()

    canvas.on('after:render', updateObjects)
    return () => {
      canvas.off('after:render', updateObjects)
    }
  }, [canvas])

  return objects?.length && canvas ? (
    <>
      {objects.map((object) => (
        <Layer
          key={`${object.createdBy}${object.createdTime}`}
          canvas={canvas}
          object={object}
          setContextMenu={setContextMenu}
          isSelected={canvas?.getActiveObjects().includes(object)}
        />
      ))}
    </>
  ) : (
    <Box margin="auto">No Layers</Box>
  )
}
