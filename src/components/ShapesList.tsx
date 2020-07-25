import { fabric } from 'fabric-pure-browser'
import debounce from 'lodash/debounce'
import React, { useEffect, useRef, useState } from 'react'
import isDeepEqual from 'react-fast-compare'
import { FiType } from 'react-icons/fi'
import AutoSizer from 'react-virtualized-auto-sizer'
import { FixedSizeList } from 'react-window'

import { Box, Icon, Label, TextButton } from '@airtable/blocks/ui'
import styled from '@emotion/styled'

import { SideBarList } from '../components'
import { shapesList } from '../tools'
import { ToolbarButton } from './toolbar'

type objectListType = {
  [objectType: string]: { icon: React.ReactNode; label: string } | undefined
}

const objectList: objectListType = {
  rect: shapesList.Rectangle,
  ellipse: shapesList.Circle,
  path: shapesList.Pen,
  textbox: { label: 'Text', icon: <FiType /> },
  group: shapesList.Arrow,
}

const ShapeBox = styled.div`
  display: flex;
  align-items: center;
  margin: 10px 0;
  border-radius: 3px;
  padding-left: 1rem;
  height: 32px;
  padding-right: 12px;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`

const Input = styled.input`
  background: none;
  border: none;
  flex: 1;
  margin: 0 0.5rem;
  font-size: 13px;
  line-height: 16px;
  font-weight: 400;
  color: hsl(0, 0%, 20%);
  font-weight: 500;
  width: 100%;

  &:focus,
  :active {
    outline: none;
    border: 2px solid rgba(0, 0, 0, 0.25);
  }
`

export const getShapeNameAndIcon = (object: fabric.Object) => {
  const type = object.type
  const conf = type ? objectList[type] : null
  return {
    name: object.name || (object as fabric.Textbox).text || conf?.label || type,
    icon: conf?.icon || <Icon name="shapes" size={16} />,
  }
}

const _Shape: React.FC<{ object: fabric.Object; isSelected?: boolean }> = ({
  object,
  isSelected,
}) => {
  const inputRef = useRef<HTMLInputElement>(null)
  const { name, icon } = getShapeNameAndIcon(object)

  const [isEditing, setEditing] = useState(false)
  const [value, setValue] = useState<string | undefined>(name)

  const save = () => {
    object.set('name', value)
    object.canvas?.fire('state:modified', { target: object })
    setEditing(false)
  }

  return (
    <ShapeBox>
      {icon}
      {isEditing ? (
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
        <TextButton
          flex="1"
          variant="dark"
          margin="0 .5rem"
          style={{ justifyContent: 'flex-start', overflow: 'hidden' }}
          onClick={() => {
            setEditing(true)
          }}
        >
          {value}
        </TextButton>
      )}

      <ToolbarButton
        hideLabel
        icon={isSelected ? 'checkboxChecked' : 'checkboxUnchecked'}
        label="Select"
        variant="secondary"
        style={{ margin: 0, padding: '0.25rem' }}
        onClick={() => {
          const canvas = object.canvas
          canvas?.setActiveObject(object)
          canvas?.requestRenderAll()
        }}
      />
      <ToolbarButton
        hideLabel
        icon="trash"
        label="Remove"
        variant="secondary"
        style={{ margin: 0, padding: '0.25rem' }}
        onClick={() => {
          const canvas = object.canvas
          canvas?.fxRemove(object)
        }}
      />
    </ShapeBox>
  )
}

const Shape = React.memo(_Shape, isDeepEqual)

export const ShapesList: React.FC<{ canvas: fabric.Canvas | null }> = ({
  canvas,
}) => {
  const listRef = useRef<FixedSizeList>(null)
  const [objects, setObjects] = useState(canvas?.getObjects())

  useEffect(() => {
    if (!canvas) return
    const updateObjects = debounce(() => {
      setObjects(canvas?.getObjects())
      listRef.current?.forceUpdate()
    }, 500)
    updateObjects()
    canvas.on('after:render', updateObjects)
    return () => {
      canvas.off('after:render', updateObjects)
    }
  }, [canvas])

  return (
    <Box flex="1" overflow="hidden" display="flex" flexDirection="column">
      <Label display="flex" alignItems="center" padding="5px">
        <Icon name="shapes" size={20} marginRight="5px" /> Shapes
        <Box marginLeft="auto">{objects?.length || 0}</Box>
      </Label>

      <SideBarList>
        {objects?.length ? (
          <AutoSizer>
            {({ height, width }) => (
              <FixedSizeList
                ref={listRef}
                style={{ outline: 'none' }}
                width={width}
                height={height}
                itemCount={objects.length}
                itemSize={42}
                overscanCount={10}
              >
                {({ index, style }) => (
                  <div key={index} style={style}>
                    <Shape
                      key={index}
                      object={objects[index]}
                      isSelected={canvas
                        ?.getActiveObjects()
                        .includes(objects[index])}
                    />
                  </div>
                )}
              </FixedSizeList>
            )}
          </AutoSizer>
        ) : (
          <Box margin="auto">No Shapes</Box>
        )}
      </SideBarList>
    </Box>
  )
}
