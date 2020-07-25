import { IObjectOptions } from 'fabric/fabric-impl'
import React from 'react'

import {
  Box,
  ColorPalette,
  colors,
  colorUtils,
  Label,
} from '@airtable/blocks/ui'
import is from '@sindresorhus/is'

import { PopoverButton } from '../../components'

interface ColorSettingProps {
  styleValue: IObjectOptions | null
  onChange: (value: IObjectOptions) => void
}

// prettier-ignore
export const allowedColors = [ 
  '',/* colors.BLUE_LIGHT_2, */ colors.CYAN_LIGHT_2, colors.GRAY_LIGHT_2, colors.GREEN_LIGHT_2, colors.ORANGE_LIGHT_2, colors.PINK_LIGHT_2, //colors.PURPLE_LIGHT_2, colors.RED_LIGHT_2, colors.TEAL_LIGHT_2, colors.YELLOW_LIGHT_2,
  // colors.BLUE_LIGHT_1, colors.CYAN_LIGHT_1, colors.GRAY_LIGHT_1, colors.GREEN_LIGHT_1, colors.ORANGE_LIGHT_1, colors.PINK_LIGHT_1, colors.PURPLE_LIGHT_1, colors.RED_LIGHT_1, colors.TEAL_LIGHT_1, colors.YELLOW_LIGHT_1,
  colors.BLUE_BRIGHT, colors.CYAN_BRIGHT, colors.GRAY_BRIGHT, colors.GREEN_BRIGHT, colors.ORANGE_BRIGHT, colors.PINK_BRIGHT, //colors.PURPLE_BRIGHT, colors.RED_BRIGHT, colors.TEAL_BRIGHT, colors.YELLOW_BRIGHT,
  // colors.BLUE, colors.CYAN, colors.GRAY, colors.GREEN, colors.ORANGE, colors.PINK, colors.PURPLE, colors.RED, colors.TEAL, colors.YELLOW,
  colors.BLUE_DARK_1, colors.CYAN_DARK_1, colors.GRAY_DARK_1, colors.GREEN_DARK_1, colors.ORANGE_DARK_1, colors.PINK_DARK_1, //colors.PURPLE_DARK_1, colors.RED_DARK_1, colors.TEAL_DARK_1, colors.YELLOW_DARK_1,
]

export const Color: React.FC<ColorSettingProps> = (props) => {
  const { styleValue, onChange } = props

  const fillColorHex = styleValue?.fill
  const strokeColorHex = styleValue?.stroke

  const fillColor =
    fillColorHex &&
    allowedColors.find(
      (color) => fillColorHex === colorUtils.getHexForColor(color)
    )

  const strokeColor =
    strokeColorHex &&
    allowedColors.find(
      (color) => strokeColorHex === colorUtils.getHexForColor(color)
    )

  const handleFillColor = (fill: string | null) => {
    styleValue && onChange({ ...styleValue, fill: fill || undefined })
  }

  const handleStrokeColor = (stroke: string | null) => {
    if (styleValue)
      onChange({
        ...styleValue,
        stroke: stroke || undefined,
        strokeWidth: styleValue.strokeWidth || 4,
      })
  }

  return (
    <PopoverButton
      icon="paint"
      label="Color"
      styleType="white"
      eventType="click"
      style={{
        backgroundColor: is.string(fillColorHex) ? fillColorHex : undefined,
        boxShadow: is.string(strokeColorHex)
          ? `${strokeColorHex} 0px 0px 0px 2px inset`
          : undefined,
        color:
          fillColor && colorUtils.shouldUseLightTextOnColor(fillColor)
            ? '#fff'
            : '#222',
      }}
    >
      <Box padding={1}>
        <Label>Fill</Label>
        <ColorPalette
          color={fillColor}
          onChange={(newColor) =>
            handleFillColor(colorUtils.getHexForColor(newColor))
          }
          allowedColors={allowedColors}
          width="160px"
        />

        <Label marginTop={2}>Stroke</Label>
        <ColorPalette
          color={strokeColor}
          onChange={(newColor) =>
            handleStrokeColor(colorUtils.getHexForColor(newColor))
          }
          allowedColors={allowedColors}
          width="160px"
        />
      </Box>
    </PopoverButton>
  )
}
