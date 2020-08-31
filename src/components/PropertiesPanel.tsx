import { fabric } from 'fabric-pure-browser'
import { IObjectOptions, ITextOptions } from 'fabric/fabric-impl'
import React from 'react'

import { SelectOption } from '@airtable/blocks/dist/types/src/ui/select_and_select_buttons_helpers'
import { Box, Icon, Text } from '@airtable/blocks/ui'

import { SidePanel } from './index'
import { getLayerNameAndIcon } from './LayersPanel'
import {
  PropertyColor,
  PropertySelect,
  PropertySwitch,
} from './PropertiesInputs'

export type PropertiesOptions = IObjectOptions & ITextOptions

interface PropertiesContextValue {
  getValue: <T extends keyof PropertiesOptions>(
    key: T
  ) => PropertiesOptions[T] | null
  setValue: (newValue: PropertiesOptions) => void
}

export const PropertiesContext = React.createContext<PropertiesContextValue>(
  {} as any
)

type PropertiesPanelProps = {
  activeLayer: fabric.Object | null
  styleValue: PropertiesOptions | null
  onChange: (value: PropertiesOptions) => void
}

export const PropertiesPanel: React.FC<PropertiesPanelProps> = (props) => {
  const { activeLayer, styleValue, onChange } = props
  const layerInfo = activeLayer && getLayerNameAndIcon(activeLayer)
  const isTextLayer = activeLayer?.isType('textbox')

  const contextValue: PropertiesContextValue = {
    getValue: (key) => styleValue?.[key],
    setValue: (newValue) => onChange({ ...styleValue, ...newValue }),
  }

  return (
    <SidePanel enableScrolling padding={2} side="right">
      <PropertiesContext.Provider value={contextValue}>
        {layerInfo && (
          <Box display="flex" flexDirection="row" alignItems="center">
            {layerInfo?.icon} <Text padding={2}>{layerInfo?.name}</Text>
          </Box>
        )}
        {isTextLayer && (
          <>
            <PropertySelect
              property="fontSize"
              label="Font Size"
              options={TextSizes}
            />
            <PropertySwitch
              property="fontWeight"
              label="Bold"
              false="normal"
              true="bold"
            />
            <PropertySwitch property="underline" label="Underline" />
            <PropertyColor
              property="textBackgroundColor"
              label="Background Color"
            />
          </>
        )}
        <PropertySelect
          buttons
          property="strokeWidth"
          label="Stroke Width"
          options={strokeOptions}
        />
        <PropertySwitch
          property="strokeDashArray"
          label="Dashed"
          false={undefined}
          true={[16]}
        />
        <PropertyColor property="stroke" label="Stroke Color" />
        <PropertyColor property="fill" label="Fill" />
      </PropertiesContext.Provider>
    </SidePanel>
  )
}

const TextSizes = [12, 18, 24, 36, 48, 64, 72, 96, 144, 288]

const scaleY = (number: number) => ({
  transform: `scaleY(${number}) scaleX(${
    number * 0.75
  }) translateY(${number}px)`,
})

const strokeOptions: SelectOption[] = [
  {
    label: <Icon name="minus" style={scaleY(1)} key="Small" />,
    value: 4,
  },
  {
    label: <Icon name="minus" style={scaleY(1.5)} key="Medium" />,
    value: 8,
  },
  {
    label: <Icon name="minus" style={scaleY(2)} key="Large" />,
    value: 12,
  },
]
