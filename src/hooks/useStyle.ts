import { fabric } from 'fabric-pure-browser'
import { IObjectOptions } from 'fabric/fabric-impl'
import pick from 'lodash/pick'
import { useCallback, useRef, useState } from 'react'

import { colors, colorUtils } from '@airtable/blocks/ui'
import is from '@sindresorhus/is/dist'

import { CanvasTool } from '../tools'
import { updateActiveObjectsStyles as updateActiveLayersStyles } from '../utils'

const filteredStyles = [
  'stroke',
  'strokeDashArray',
  'strokeWidth',
  'fill',
  'fontSize',
  'fontWeight',
  'fontStyle',
  'underline',
  'textBackgroundColor',
]

export const DEFAULT_COLOR = colors.RED_BRIGHT

export const defaultStyle: IObjectOptions = {
  stroke: colorUtils.getHexForColor(DEFAULT_COLOR)!,
  strokeWidth: 8,
  fill: 'transparent',
}

export const useStyle = (
  activeTool: CanvasTool | null,
  canvas: fabric.Canvas | null
) => {
  const [activeStyle, _setActiveStyle] = useState<IObjectOptions>(defaultStyle)
  const [activeLayer, setActiveLayer] = useState<fabric.Object | null>(null)
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
        updateActiveLayersStyles(canvas, newFilteredStyle)
      }
    },
    [updateActiveStyle, canvas]
  )

  const setSelectedLayerStyle = useCallback(
    (event?: fabric.IEvent) => {
      const selectedLayer = event?.selected?.[0]
      if (
        event?.selected?.length === 1 &&
        selectedLayer instanceof fabric.Object &&
        !(selectedLayer instanceof fabric.Group)
      ) {
        setActiveLayer(selectedLayer)

        const layerStyles: IObjectOptions = selectedLayer.toObject()

        const fill = is.nonEmptyString(layerStyles.fill)
          ? layerStyles.fill
          : 'transparent'

        if (!defaultStyles.current) {
          defaultStyles.current = activeStyle
        }
        updateActiveStyle(pick({ ...layerStyles, fill }, filteredStyles))
      } else if (defaultStyles.current) {
        setActiveLayer(null)
        updateActiveStyle(defaultStyles.current)
        defaultStyles.current = null
      } else {
        setActiveLayer(null)
      }
    },
    [activeStyle, updateActiveStyle]
  )

  return {
    activeLayer,
    activeStyle,
    updateUserStyles,
    setSelectedLayer: setSelectedLayerStyle,
  }
}
