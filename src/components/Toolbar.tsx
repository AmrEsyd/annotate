import { fabric } from 'fabric-pure-browser'
import React, { useContext, useRef, useState } from 'react'
import { FiMousePointer, FiMove, FiType } from 'react-icons/fi'

import { PermissionCheckResult } from '@airtable/blocks/dist/types/src/types/mutations'
import { Box, colorUtils } from '@airtable/blocks/ui'

import { EditorContext } from '../Editor'
import { DEFAULT_COLOR, useHotkeys } from '../hooks'
import { Move, Select, shapesList } from '../tools'
import { EmojiPicker } from './EmojiPicker'
import {
  IconButton,
  MenuOption,
  PopoverButton,
  PopoverButtonRef,
  ToolbarContainer,
  toolsKeys,
} from './index'

type ToolbarProps = {
  ToolbarButtons?: React.ReactNode
  ToolbarButtonsRight?: React.ReactNode
  updatePermission?: PermissionCheckResult | null
}

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const { updatePermission, ToolbarButtons, ToolbarButtonsRight } = props

  const { canvas, activeTool, handleToolChange } = useContext(EditorContext)

  const toolsListMenu = useRef<PopoverButtonRef>(null)
  const [selectedShape, setSelectedShape] = useState<
    typeof shapesList[keyof typeof shapesList]
  >(shapesList.Rectangle)

  useHotkeys(
    Object.keys(toolsKeys),
    (_k, event) => {
      const key = event.key as keyof typeof toolsKeys
      const tool = toolsKeys[key]

      const updateSelectedShape = (shapeName: keyof typeof shapesList) => {
        const tool = shapesList[shapeName]
        if (tool && canvas) {
          const newTool = new tool.class(canvas)
          canvas && handleToolChange(newTool)
          setSelectedShape(tool)
        }
      }

      switch (tool) {
        case 'Arrow':
        case 'Circle':
        case 'Line':
        case 'Pencil':
        case 'Rectangle':
          return updateSelectedShape(tool)
      }
    },
    [handleToolChange, setSelectedShape]
  )

  const createText = (text: string = 'Text') => {
    if (!canvas) return
    const textObject = new fabric.Textbox(text, {
      fill: colorUtils.getHexForColor(DEFAULT_COLOR)!,
      fontSize: 64,
      fontFamily: "-apple-system,system-ui,BlinkMacSystemFont,'Segoe UI'",
    })
    canvas.add(textObject)
    canvas.viewportCenterObject(textObject)
    canvas.setActiveObject(textObject)
    handleToolChange(null)
  }

  const toolsOptions = Object.values(shapesList).map(
    (tool): MenuOption => {
      const newTool = canvas && new tool.class(canvas)

      const selectTool = () => {
        canvas && handleToolChange(newTool)
        setSelectedShape(tool)
      }

      return {
        label: tool.label,
        icon: tool.icon,
        shortcutId: tool.label,
        isSelected: activeTool instanceof tool.class,
        onClick: selectTool,
      }
    }
  )

  const isSelectingShape = activeTool instanceof selectedShape.class

  return (
    <ToolbarContainer>
      {ToolbarButtons}
      {updatePermission && !updatePermission.hasPermission && (
        <IconButton
          hideLabel
          display="flex"
          flex="1"
          label={`Changes will not be saved. ${
            updatePermission.reasonDisplayString || ''
          }`}
          icon="lock"
          variant="danger"
        />
      )}
      <Box flex="1" />
      <IconButton
        icon={<FiMousePointer strokeWidth="3" />}
        label="Select"
        shortcutId="select"
        onClick={() => canvas && handleToolChange(new Select(canvas))}
        isSelected={activeTool instanceof Select}
      />
      <IconButton
        icon={<FiMove strokeWidth="3" />}
        label="Move"
        shortcutId="move"
        onClick={() => canvas && handleToolChange(new Move(canvas))}
        isSelected={activeTool instanceof Move}
      />
      <Box
        display="flex"
        borderRadius="3px"
        padding="0.0rem 0.1rem"
        marginRight="0.25rem"
        style={{
          background: isSelectingShape ? 'hsl(0,0%,95%)' : undefined,
        }}
      >
        <IconButton
          style={{ margin: 0, padding: '0.25rem 0.4rem' }}
          icon={selectedShape?.icon}
          label={selectedShape?.label || ''}
          shortcutId={selectedShape.label}
          labelStyle={{ width: '5em', display: 'block' }}
          onClick={() => {
            if (activeTool?.name === selectedShape?.class.name) {
              toolsListMenu.current?.togglePopover()
            } else {
              canvas &&
                selectedShape &&
                handleToolChange(new selectedShape.class(canvas))
            }
          }}
        />
        <PopoverButton
          ref={toolsListMenu}
          hideLabel
          closeOnClick
          style={{ margin: 0, padding: '0.25rem 0.2rem' }}
          icon="caret"
          label="Select shape"
          styleType="white"
          eventType="click"
          options={toolsOptions}
        />
      </Box>
      <IconButton
        icon={<FiType strokeWidth="3" />}
        label="Text"
        shortcutId="Text"
        onClick={() => createText()}
      />
      <EmojiPicker onSelect={createText} />
      <Box flex="1" />
      {ToolbarButtonsRight}
    </ToolbarContainer>
  )
}
