import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import findKey from 'lodash/findKey'
import React, { useState } from 'react'
import { FiMousePointer, FiType } from 'react-icons/fi'

import { PermissionCheckResult } from '@airtable/blocks/dist/types/src/types/mutations'
import { Box, colors, colorUtils } from '@airtable/blocks/ui'

import {
  MenuOption,
  PopoverButton,
  ToolbarButton,
  ToolbarContainer,
  toolsKeys,
} from '../'
import { useHotkeys } from '../../hooks'
import { CanvasTool, Select, shapesList } from '../../tools'
import { StylingOptions } from '../stylingOptions'
import { EmojiPicker } from './EmojiPicker'

type ToolbarProps = {
  ToolbarButtons?: React.ReactNode
  canvasMenuOptions: MenuOption[]
  canvas: fabric.Canvas | null
  currentTool: CanvasTool | null
  handleToolChange: (tool: CanvasTool | null) => void
  styleValue: IObjectOptions | null
  handleStyleValueChange: (tool: IObjectOptions) => void
  updatePermission?: PermissionCheckResult | null
}

export const Toolbar: React.FC<ToolbarProps> = (props) => {
  const {
    canvas,
    handleToolChange,
    styleValue,
    handleStyleValueChange,
    updatePermission,
    currentTool,
    ToolbarButtons,
    canvasMenuOptions,
  } = props

  const [selectedShape, setSelectedShape] = useState<
    typeof shapesList[keyof typeof shapesList]
  >(shapesList.Rectangle)

  useHotkeys(
    Object.keys(toolsKeys).join(),
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
        case 'Pen':
        case 'Rectangle':
          return updateSelectedShape(tool)
      }
    },
    [handleToolChange, setSelectedShape]
  )

  const createText = (text: string = 'Text') => {
    if (!canvas) return
    const textObject = new fabric.Textbox(text, {
      fill: colorUtils.getHexForColor(colors.BLUE_BRIGHT)!,
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
        isSelected: currentTool instanceof tool.class,
        onClick: selectTool,
      }
    }
  )

  const isSelectingShape = currentTool instanceof selectedShape.class

  return (
    <ToolbarContainer>
      {ToolbarButtons}
      {updatePermission && !updatePermission.hasPermission && (
        <ToolbarButton
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
      <ToolbarButton
        icon={<FiMousePointer strokeWidth="3" />}
        label="Select"
        shortcutId="select"
        onClick={() => canvas && handleToolChange(new Select(canvas))}
        isSelected={currentTool instanceof Select}
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
        <ToolbarButton
          style={{ margin: 0, padding: '0.25rem 0.1rem' }}
          icon={selectedShape?.icon}
          label={selectedShape?.label || ''}
          shortcutId={selectedShape.label}
          onClick={() =>
            canvas &&
            selectedShape &&
            handleToolChange(new selectedShape.class(canvas))
          }
        />
        <PopoverButton
          hideLabel
          closeOnClick
          style={{ margin: 0, padding: '0.25rem 0.1rem' }}
          icon="caret"
          label="Select shape"
          styleType="white"
          eventType="click"
          options={toolsOptions}
        />
      </Box>
      <ToolbarButton
        icon={<FiType strokeWidth="3" />}
        label="Text"
        shortcutId="Text"
        onClick={() => createText()}
      />
      <EmojiPicker onSelect={createText} />
      <Box flex="1" />
      <StylingOptions
        styleValue={styleValue}
        onChange={handleStyleValueChange}
      />
      <Box flex="1" />
      <PopoverButton
        closeOnClick
        hideLabel
        icon="overflow"
        label="Menu"
        styleType="dark"
        eventType="click"
        options={canvasMenuOptions}
      />
    </ToolbarContainer>
  )
}
