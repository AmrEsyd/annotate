import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import pick from 'lodash/pick'
import { useCallback, useRef, useState } from 'react'

import { colors, colorUtils } from '@airtable/blocks/ui'
import is from '@sindresorhus/is/dist'

import { CanvasTool } from '../tools'
import { updateActiveObjectsStyles } from '../utils'

const filteredStyles = [
  'stroke',
  'strokeDashArray',
  'strokeWidth',
  'fill',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'underline',
  'overline',
  'linethrough',
  'textBackgroundColor',
]

export const defaultStyle: IObjectOptions = {
  stroke: colorUtils.getHexForColor(colors.BLUE_BRIGHT)!,
  strokeWidth: 8,
  fill: 'transparent',
}

export const useStyle = (
  activeTool: CanvasTool | null,
  canvas: fabric.Canvas | null
) => {
  const [activeStyle, _setActiveStyle] = useState<IObjectOptions>(defaultStyle)
  const defaultStyles = useRef<IObjectOptions | null>(defaultStyle)

  const updateActiveStyle = useCallback(
    (newStyleValue: fabric.IObjectOptions) => {
      let newFilteredStyle = pick(newStyleValue, filteredStyles)
      if (is.nonEmptyObject(newFilteredStyle)) {
        const fill = newFilteredStyle.fill || 'transparent'
        newFilteredStyle = { ...newFilteredStyle, fill }
        _setActiveStyle(newFilteredStyle)
        activeTool?.configureCanvas?.(newFilteredStyle)
        return newFilteredStyle
      }
    },
    [activeTool]
  )

  const updateUserStyles = useCallback(
    (newStyleValue: fabric.IObjectOptions) => {
      let newFilteredStyle = updateActiveStyle(newStyleValue)
      if (is.nonEmptyObject(newFilteredStyle)) {
        updateActiveObjectsStyles(canvas, newFilteredStyle)
      }
    },
    [updateActiveStyle, canvas]
  )

  const getObjectStyles = useCallback(
    (event?: fabric.IEvent) => {
      const selectedObject = event?.selected?.[0]
      if (
        event?.selected?.length === 1 &&
        selectedObject instanceof fabric.Object &&
        !(selectedObject instanceof fabric.Group)
      ) {
        const objectStyles: IObjectOptions = selectedObject.toObject()

        const fill = is.nonEmptyString(objectStyles.fill)
          ? objectStyles.fill
          : 'transparent'

        if (!defaultStyles.current) {
          defaultStyles.current = activeStyle
        }
        updateActiveStyle(pick({ ...objectStyles, fill }, filteredStyles))
      } else if (defaultStyles.current) {
        updateActiveStyle(defaultStyles.current)
        defaultStyles.current = null
      }
    },
    [activeStyle, updateActiveStyle]
  )

  return {
    activeStyle,
    updateUserStyles,
    setSelectedObjectStyle: getObjectStyles,
  }
}
